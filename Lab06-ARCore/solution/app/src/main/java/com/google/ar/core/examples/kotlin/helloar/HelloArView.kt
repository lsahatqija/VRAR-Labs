/* Copyright 2021 Google LLC. Licensed under the Apache License, Version 2.0. */
package com.google.ar.core.examples.kotlin.helloar

import android.opengl.GLSurfaceView
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.google.ar.core.examples.java.common.helpers.SnackbarHelper
import java.util.concurrent.ArrayBlockingQueue

sealed interface RenderEvent {
  object Select : RenderEvent
  object Reset : RenderEvent
}

/** Main-thread UI. Events cross to the render thread through a bounded queue. */
class HelloArView(private val activity: HelloArActivity) : DefaultLifecycleObserver {
  val root: View = View.inflate(activity, R.layout.activity_main, null)
  val surfaceView: GLSurfaceView = root.findViewById(R.id.surfaceview)
  val snackbarHelper = SnackbarHelper()
  private val events = ArrayBlockingQueue<RenderEvent>(8)
  private val status: TextView = root.findViewById(R.id.status_text)
  private val pose: TextView = root.findViewById(R.id.pose_panel)
  private val instruction: TextView = root.findViewById(R.id.instruction_text)
  private val measurement: TextView = root.findViewById(R.id.measurement_text)
  private val reticle: View = root.findViewById(R.id.reticle)
  private val posePanel: View = root.findViewById(R.id.pose_panel)

  init {
    surfaceView.setOnTouchListener { _, event ->
      if (event.action == MotionEvent.ACTION_UP) events.offer(RenderEvent.Select)
      true
    }
    root.findViewById<Button>(R.id.reset_button).setOnClickListener { queueReset() }
    root.findViewById<Button>(R.id.pose_toggle).setOnClickListener {
      posePanel.visibility = if (posePanel.visibility == View.VISIBLE) View.GONE else View.VISIBLE
    }
  }

  fun pollRenderEvent(): RenderEvent? = events.poll()
  fun queueReset() { events.offer(RenderEvent.Reset) }
  fun publishStatus(value: String) = onUi { status.text = value }
  fun publishPose(value: String?) = onUi {
    pose.text = value ?: "Position: —\nQuaternion (x, y, z, w): —"
  }
  fun publishInstruction(value: String) = onUi { instruction.text = value }
  fun publishMeasurement(value: String?) = onUi { measurement.text = value ?: "Distance: —" }
  fun publishReticle(valid: Boolean) = onUi {
    reticle.isActivated = valid
    reticle.contentDescription = if (valid) "Valid surface hit" else "No valid surface hit"
  }
  fun showFatalError(message: String) = onUi { snackbarHelper.showError(activity, message) }
  private fun onUi(action: () -> Unit) = activity.runOnUiThread(action)

  override fun onResume(owner: LifecycleOwner) = surfaceView.onResume()
  override fun onPause(owner: LifecycleOwner) = surfaceView.onPause()
}
