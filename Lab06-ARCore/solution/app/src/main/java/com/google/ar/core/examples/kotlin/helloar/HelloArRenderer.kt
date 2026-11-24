/* Copyright 2021 Google LLC. Licensed under the Apache License, Version 2.0. */
package com.google.ar.core.examples.kotlin.helloar

import android.opengl.Matrix
import android.util.Log
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.google.ar.core.Anchor
import com.google.ar.core.Camera
import com.google.ar.core.Frame
import com.google.ar.core.HitResult
import com.google.ar.core.Plane
import com.google.ar.core.Pose
import com.google.ar.core.Session
import com.google.ar.core.TrackingFailureReason
import com.google.ar.core.TrackingState
import com.google.ar.core.examples.java.common.helpers.DisplayRotationHelper
import com.google.ar.core.examples.java.common.helpers.TrackingStateHelper
import com.google.ar.core.examples.java.common.samplerender.Framebuffer
import com.google.ar.core.examples.java.common.samplerender.Mesh
import com.google.ar.core.examples.java.common.samplerender.SampleRender
import com.google.ar.core.examples.java.common.samplerender.Shader
import com.google.ar.core.examples.java.common.samplerender.VertexBuffer
import com.google.ar.core.examples.java.common.samplerender.arcore.BackgroundRenderer
import com.google.ar.core.examples.java.common.samplerender.arcore.PlaneRenderer
import com.google.ar.core.exceptions.CameraNotAvailableException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.Locale

/** Owns ARCore frame state on the GL thread. Students edit only the four TODO functions. */
class HelloArRenderer(private val activity: HelloArActivity) :
  SampleRender.Renderer, DefaultLifecycleObserver {
  companion object {
    private const val TAG = "MeasureRenderer"
    private const val Z_NEAR = 0.1f
    private const val Z_FAR = 100f
  }

  private lateinit var background: BackgroundRenderer
  private lateinit var planes: PlaneRenderer
  private lateinit var scene: Framebuffer
  private lateinit var vertices: VertexBuffer
  private lateinit var markerMesh: Mesh
  private lateinit var lineMesh: Mesh
  private lateinit var markerShader: Shader
  private lateinit var lineShader: Shader
  private var textureSet = false
  private val rotation = DisplayRotationHelper(activity)
  private val tracking = TrackingStateHelper(activity)
  private val projection = FloatArray(16)
  private val view = FloatArray(16)
  private val viewProjection = FloatArray(16)
  private val anchors = mutableListOf<Anchor>()
  private var currentHit: HitResult? = null
  private val session: Session? get() = activity.arCoreSessionHelper.session

  override fun onResume(owner: LifecycleOwner) { rotation.onResume(); textureSet = false }
  override fun onPause(owner: LifecycleOwner) = rotation.onPause()
  override fun onDestroy(owner: LifecycleOwner) {
    // Session.close() also releases anchors; detach explicitly so no native handle outlives us.
    anchors.forEach(Anchor::detach)
    anchors.clear()
  }

  override fun onSurfaceCreated(render: SampleRender) {
    background = BackgroundRenderer(render)
    background.setUseDepthVisualization(render, false)
    background.setUseOcclusion(render, false)
    planes = PlaneRenderer(render)
    scene = Framebuffer(render, 1, 1)
    vertices = VertexBuffer(render, 3, null)
    markerMesh = Mesh(render, Mesh.PrimitiveMode.POINTS, null, arrayOf(vertices))
    lineMesh = Mesh(render, Mesh.PrimitiveMode.LINES, null, arrayOf(vertices))
    markerShader = shader(render, floatArrayOf(1f, .75f, .08f, 1f), 28f)
    lineShader = shader(render, floatArrayOf(.15f, .9f, 1f, 1f), 1f)
  }

  private fun shader(render: SampleRender, color: FloatArray, size: Float) =
    Shader.createFromAssets(render, "shaders/lab_points.vert", "shaders/lab_color.frag", null)
      .setVec4("u_Color", color).setFloat("u_PointSize", size)

  override fun onSurfaceChanged(render: SampleRender, width: Int, height: Int) {
    rotation.onSurfaceChanged(width, height)
    scene.resize(width, height)
  }

  override fun onDrawFrame(render: SampleRender) {
    val activeSession = session ?: return
    if (!textureSet) {
      activeSession.setCameraTextureNames(intArrayOf(background.cameraColorTexture.textureId))
      textureSet = true
    }
    rotation.updateSessionIfNeeded(activeSession)
    val frame = try { activeSession.update() } catch (error: CameraNotAvailableException) {
      Log.e(TAG, "Camera unavailable", error)
      activity.view.showFatalError("Camera unavailable. Restart the app.")
      return
    }
    val camera = frame.camera
    background.updateDisplayGeometry(frame)
    if (frame.timestamp != 0L) background.drawBackground(render)
    tracking.updateKeepScreenOnFlag(camera.trackingState)
    publishTracking(camera, activeSession.hasTrackingPlane())
    updateCameraPose(camera) // TODO 1: reached every frame.
    currentHit = findCenterPlaneHit(frame, camera) // TODO 2: reached every frame.

    while (true) when (activity.view.pollRenderEvent() ?: break) {
      RenderEvent.Select -> selectCurrentHit(currentHit) // TODO 3
      RenderEvent.Reset -> clearMeasurement()
    }
    if (camera.trackingState != TrackingState.TRACKING) {
      currentHit = null
      activity.view.publishReticle(false)
      return
    }
    camera.getProjectionMatrix(projection, 0, Z_NEAR, Z_FAR)
    camera.getViewMatrix(view, 0)
    Matrix.multiplyMM(viewProjection, 0, projection, 0, view, 0)
    planes.drawPlanes(render, activeSession.getAllTrackables(Plane::class.java), camera.displayOrientedPose, projection)
    render.clear(scene, 0f, 0f, 0f, 0f)
    drawReticle(render, currentHit?.hitPose)
    val tracked = anchors.filter { it.trackingState == TrackingState.TRACKING }.map { it.pose }
    drawEndpoints(render, tracked)
    updateDistanceAndLine(render, tracked) // TODO 4
    background.drawVirtualScene(render, scene, Z_NEAR, Z_FAR)
    currentHit = null // Frame and HitResult are never retained across AR frames.
  }

  /** TODO 1 — CAMERA POSE
   * If camera is TRACKING, read camera.pose.translation and rotationQuaternion, format them, and
   * call activity.view.publishPose(...). Otherwise publish null. Quaternion components are not
   * individual Euler angles.
   */
  private fun updateCameraPose(camera: Camera) {
    if (camera.trackingState != TrackingState.TRACKING) {
      activity.view.publishPose(null)
      return
    }
    val position = camera.pose.translation
    val rotation = camera.pose.rotationQuaternion
    activity.view.publishPose(
      String.format(
        Locale.US,
        "Position: %.3f, %.3f, %.3f\nQuaternion (x, y, z, w): %.3f, %.3f, %.3f, %.3f",
        position[0], position[1], position[2],
        rotation[0], rotation[1], rotation[2], rotation[3]
      )
    )
  }

  /** TODO 2 — CENTER-SCREEN HIT TEST
   * Call frame.hitTest(surfaceView.width/2f, surfaceView.height/2f). Return the first hit whose
   * trackable is a TRACKING Plane and whose hit pose is inside its polygon. Display geometry is
   * already current. Publish the reticle state, but do not create an anchor here.
   */
  private fun findCenterPlaneHit(frame: Frame, camera: Camera): HitResult? {
    val hit = if (camera.trackingState == TrackingState.TRACKING) {
      frame.hitTest(activity.view.surfaceView.width / 2f, activity.view.surfaceView.height / 2f)
        .firstOrNull {
          val plane = it.trackable as? Plane
          plane?.trackingState == TrackingState.TRACKING && plane.isPoseInPolygon(it.hitPose)
        }
    } else null
    activity.view.publishReticle(hit != null)
    return hit
  }

  /** TODO 3 — SELECTION AND ANCHOR LIFECYCLE
   * Ignore null hits and taps after two points. Call hit.createAnchor(), add it to anchors, and
   * publish the next instruction. This runs on the GL thread. Reset/destruction already detach all
   * anchors in clearMeasurement().
   */
  private fun selectCurrentHit(hit: HitResult?) {
    if (hit == null || anchors.size >= 2) return
    anchors += hit.createAnchor()
    activity.view.publishInstruction(
      if (anchors.size == 1) "Aim at a surface and tap to select point 2"
      else "Measurement complete. Tap Reset to measure again"
    )
  }

  /** TODO 4 — DISTANCE
   * With exactly two TRACKING poses, use their current translations, call distanceMeters(a, b),
   * publish formattedDistance(result), and call drawLine(render, a, b). Otherwise publish null.
   */
  private fun updateDistanceAndLine(render: SampleRender, poses: List<Pose>) {
    if (poses.size != 2) {
      activity.view.publishMeasurement(null)
      return
    }
    val a = poses[0].translation
    val b = poses[1].translation
    val distance = distanceMeters(a, b)
    activity.view.publishMeasurement(distance?.let(::formattedDistance))
    if (distance != null) drawLine(render, a, b)
  }

  /** Pure Kotlin calculation for TODO 4. */
  internal fun distanceMeters(a: FloatArray, b: FloatArray): Float? {
    if (a.size < 3 || b.size < 3) return null
    val dx = a[0] - b[0]
    val dy = a[1] - b[1]
    val dz = a[2] - b[2]
    return kotlin.math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  private fun clearMeasurement() {
    anchors.forEach(Anchor::detach)
    anchors.clear()
    activity.view.publishMeasurement(null)
    activity.view.publishInstruction("Aim at a surface and tap to select point 1")
  }

  /** Provided: transient world-space reticle; no anchor is created. */
  private fun drawReticle(render: SampleRender, pose: Pose?) {
    activity.view.publishReticle(pose != null)
    if (pose != null) drawPoints(render, listOf(pose), floatArrayOf(.3f, 1f, .45f, 1f), 18f)
  }

  /** Provided: renders up to two current anchor poses. */
  private fun drawEndpoints(render: SampleRender, poses: List<Pose>) {
    if (poses.isNotEmpty()) drawPoints(render, poses.take(2), floatArrayOf(1f, .75f, .08f, 1f), 28f)
  }

  private fun drawPoints(render: SampleRender, poses: List<Pose>, color: FloatArray, size: Float) {
    vertices.set(buffer(poses.flatMap { it.translation.asList() }.toFloatArray()))
    markerShader.setMat4("u_ModelViewProjection", viewProjection).setVec4("u_Color", color).setFloat("u_PointSize", size)
    render.draw(markerMesh, markerShader, scene)
  }

  /** Provided for TODO 4: renders a 3D line between two world-space points. */
  private fun drawLine(render: SampleRender, a: FloatArray, b: FloatArray) {
    vertices.set(buffer(floatArrayOf(a[0], a[1], a[2], b[0], b[1], b[2])))
    lineShader.setMat4("u_ModelViewProjection", viewProjection)
    render.draw(lineMesh, lineShader, scene)
  }

  private fun buffer(values: FloatArray): FloatBuffer = ByteBuffer.allocateDirect(values.size * 4)
    .order(ByteOrder.nativeOrder()).asFloatBuffer().apply { put(values); rewind() }

  private fun publishTracking(camera: Camera, hasPlane: Boolean) {
    val text = when {
      camera.trackingState == TrackingState.TRACKING && hasPlane -> "Tracking • surface found"
      camera.trackingState == TrackingState.TRACKING -> "Tracking • move slowly to find a surface"
      camera.trackingFailureReason == TrackingFailureReason.NONE -> "Initializing AR tracking…"
      else -> "Tracking paused: ${TrackingStateHelper.getTrackingFailureReasonString(camera)}"
    }
    activity.view.publishStatus(text)
  }

  private fun Session.hasTrackingPlane() = getAllTrackables(Plane::class.java)
    .any { it.trackingState == TrackingState.TRACKING }

  internal fun formattedDistance(meters: Float) = if (meters < 1f)
    String.format(Locale.US, "%.1f cm", meters * 100f)
  else String.format(Locale.US, "%.3f m", meters)
}
