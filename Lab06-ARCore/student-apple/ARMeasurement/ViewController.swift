import ARKit
import SceneKit
import UIKit

/// Owns ARKit frame state. Students edit only the four numbered TODO sections.
final class ViewController: UIViewController, ARSCNViewDelegate, ARSessionDelegate {
    private let sceneView = ARSCNView(frame: .zero)
    private let statusLabel = OverlayLabel()
    private let poseLabel = OverlayLabel()
    private let instructionLabel = OverlayLabel()
    private let measurementLabel = OverlayLabel(font: .monospacedDigitSystemFont(ofSize: 24, weight: .bold))
    private let poseButton = UIButton(type: .system)
    private let resetButton = UIButton(type: .system)
    private let screenReticle = UIView()

    private let reticleNode = SCNNode(geometry: SCNSphere(radius: 0.005))
    private let lineNode = SCNNode()
    private let stateLock = NSLock()
    private var measurementAnchors: [ARAnchor] = []
    private var currentHitTransform: simd_float4x4?

    override func viewDidLoad() {
        super.viewDidLoad()
        buildInterface()
        configureScene()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        guard ARWorldTrackingConfiguration.isSupported else {
            showFatalError("This device does not support ARKit world tracking.")
            return
        }
        let configuration = ARWorldTrackingConfiguration()
        configuration.planeDetection = [.horizontal, .vertical]
        sceneView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        sceneView.session.pause()
    }

    private func configureScene() {
        sceneView.scene = SCNScene()
        sceneView.delegate = self
        sceneView.session.delegate = self
        sceneView.automaticallyUpdatesLighting = true
        sceneView.debugOptions = [.showFeaturePoints]

        reticleNode.geometry?.firstMaterial?.diffuse.contents = UIColor.systemGreen
        reticleNode.isHidden = true
        sceneView.scene.rootNode.addChildNode(reticleNode)

        lineNode.isHidden = true
        sceneView.scene.rootNode.addChildNode(lineNode)
    }

    // MARK: - Frame update

    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        guard let frame = sceneView.session.currentFrame else { return }
        publishTracking(frame)
        updateCameraPose(frame) // TODO 1: reached every frame.
        let hit = findCenterPlaneHit(frame) // TODO 2: reached every frame.

        stateLock.locked { currentHitTransform = hit }
        renderReticle(at: hit)

        let anchors = stateLock.locked { measurementAnchors }
        let nodes = anchors.compactMap { sceneView.node(for: $0) }
        updateDistanceAndLine(nodes) // TODO 4: reached every frame.
    }

    /// TODO 1 — CAMERA POSE
    /// If camera tracking is normal, read `frame.camera.transform`, extract its translation and a
    /// `simd_quatf`, format x/y/z and x/y/z/w, and call `publishPose(...)`. Otherwise publish nil.
    /// Quaternion components describe one rotation; they are not separate Euler angles.
    private func updateCameraPose(_ frame: ARFrame) {
        publishPose(nil)
    }

    /// TODO 2 — CENTER-SCREEN RAYCAST
    /// If tracking is normal, use the actual `sceneView.bounds.midX/midY` to create a raycast query
    /// that allows `.existingPlaneGeometry` with `.any` alignment. Return the first result's
    /// `worldTransform`. Call `publishReticle(...)`, but do not create an anchor here.
    private func findCenterPlaneHit(_ frame: ARFrame) -> simd_float4x4? {
        publishReticle(false)
        return nil
    }

    /// TODO 3 — SELECTION AND ANCHOR LIFECYCLE
    /// Ignore a nil transform and taps after `measurementAnchorCount` reaches two. Create
    /// `ARAnchor(name:transform:)`, add it to `sceneView.session`, call
    /// `storeMeasurementAnchor(_:)`, and publish the next instruction. Reset already removes every
    /// measurement anchor from the session.
    private func selectCurrentHit(_ transform: simd_float4x4?) {
        publishInstruction("TODO 3: create an anchor from the current valid hit")
    }

    /// TODO 4 — DISTANCE
    /// With exactly two current anchor nodes, read both `simdWorldPosition` values, call
    /// `distanceMeters(_:_:)`, publish `formattedDistance(_:)`, and call `drawLine(from:to:)`.
    /// Otherwise publish nil and hide the line.
    private func updateDistanceAndLine(_ nodes: [SCNNode]) {
        publishMeasurement(nil)
        lineNode.isHidden = true
    }

    /// Pure Swift calculation for TODO 4. Return nil until Euclidean distance is implemented.
    internal func distanceMeters(_ a: SIMD3<Float>, _ b: SIMD3<Float>) -> Float? {
        nil
    }

    // MARK: - Provided AR content

    func renderer(_ renderer: SCNSceneRenderer, didAdd node: SCNNode, for anchor: ARAnchor) {
        if let plane = anchor as? ARPlaneAnchor {
            node.addChildNode(makePlaneNode(for: plane))
        } else if anchor.name == "measurement-point" {
            let marker = SCNSphere(radius: 0.008)
            marker.firstMaterial?.diffuse.contents = UIColor.systemYellow
            marker.firstMaterial?.lightingModel = .constant
            node.addChildNode(SCNNode(geometry: marker))
        }
    }

    func renderer(_ renderer: SCNSceneRenderer, didUpdate node: SCNNode, for anchor: ARAnchor) {
        guard let plane = anchor as? ARPlaneAnchor,
              let planeNode = node.childNode(withName: "detected-plane", recursively: false),
              let geometry = planeNode.geometry as? SCNPlane else { return }
        geometry.width = CGFloat(plane.extent.x)
        geometry.height = CGFloat(plane.extent.z)
        planeNode.simdPosition = SIMD3<Float>(plane.center.x, 0, plane.center.z)
    }

    private func makePlaneNode(for anchor: ARPlaneAnchor) -> SCNNode {
        let plane = SCNPlane(width: CGFloat(anchor.extent.x), height: CGFloat(anchor.extent.z))
        plane.firstMaterial?.diffuse.contents = UIColor.systemTeal.withAlphaComponent(0.22)
        plane.firstMaterial?.isDoubleSided = true
        let node = SCNNode(geometry: plane)
        node.name = "detected-plane"
        node.eulerAngles.x = -.pi / 2
        node.simdPosition = SIMD3<Float>(anchor.center.x, 0, anchor.center.z)
        return node
    }

    private func renderReticle(at transform: simd_float4x4?) {
        guard let transform else {
            reticleNode.isHidden = true
            return
        }
        reticleNode.simdTransform = transform
        reticleNode.isHidden = false
    }

    /// Provided for TODO 4: renders a cyan 3D line between two world-space points.
    private func drawLine(from a: SIMD3<Float>, to b: SIMD3<Float>) {
        let delta = b - a
        let length = simd_length(delta)
        guard length > 0 else {
            lineNode.isHidden = true
            return
        }
        let cylinder = SCNCylinder(radius: 0.002, height: CGFloat(length))
        cylinder.firstMaterial?.diffuse.contents = UIColor.systemCyan
        cylinder.firstMaterial?.lightingModel = .constant
        lineNode.geometry = cylinder
        lineNode.simdPosition = (a + b) / 2
        lineNode.simdOrientation = simd_quatf(from: SIMD3<Float>(0, 1, 0), to: delta / length)
        lineNode.isHidden = false
    }

    private func storeMeasurementAnchor(_ anchor: ARAnchor) {
        stateLock.locked { measurementAnchors.append(anchor) }
    }

    private var measurementAnchorCount: Int {
        stateLock.locked { measurementAnchors.count }
    }

    private func clearMeasurement() {
        let anchors = stateLock.locked { () -> [ARAnchor] in
            let copy = measurementAnchors
            measurementAnchors.removeAll()
            return copy
        }
        anchors.forEach { sceneView.session.remove(anchor: $0) }
        lineNode.isHidden = true
        publishMeasurement(nil)
        publishInstruction("Aim at a surface and tap to select point 1")
    }

    // MARK: - Tracking and presentation

    func session(_ session: ARSession, cameraDidChangeTrackingState camera: ARCamera) {
        guard case .limited(let reason) = camera.trackingState else { return }
        let message: String
        switch reason {
        case .initializing: message = "Initializing AR tracking…"
        case .excessiveMotion: message = "Tracking paused: move the device more slowly"
        case .insufficientFeatures: message = "Tracking paused: point at a textured, well-lit area"
        case .relocalizing: message = "Tracking paused: returning to the mapped area…"
        @unknown default: message = "Tracking is temporarily limited"
        }
        publishStatus(message)
    }

    func session(_ session: ARSession, didFailWithError error: Error) {
        showFatalError("AR session failed: \(error.localizedDescription)")
    }

    func sessionWasInterrupted(_ session: ARSession) {
        publishStatus("AR session interrupted")
    }

    func sessionInterruptionEnded(_ session: ARSession) {
        publishStatus("AR session resumed — move slowly to restore tracking")
    }

    private func publishTracking(_ frame: ARFrame) {
        let hasPlane = frame.anchors.contains { $0 is ARPlaneAnchor }
        let text: String
        switch frame.camera.trackingState {
        case .normal where hasPlane: text = "Tracking • surface found"
        case .normal: text = "Tracking • move slowly to find a surface"
        case .notAvailable: text = "Tracking unavailable"
        case .limited: return // The session callback provides the specific reason.
        }
        publishStatus(text)
    }

    internal func formattedDistance(_ meters: Float) -> String {
        meters < 1
            ? String(format: "%.1f cm", meters * 100)
            : String(format: "%.3f m", meters)
    }

    private func publishStatus(_ text: String) { setText(text, on: statusLabel) }
    private func publishPose(_ text: String?) {
        setText(text ?? "Position: —\nQuaternion (x, y, z, w): —\nTODO 1", on: poseLabel)
    }
    private func publishInstruction(_ text: String) { setText(text, on: instructionLabel) }
    private func publishMeasurement(_ text: String?) {
        setText("Distance: \(text ?? "—")", on: measurementLabel)
    }
    private func publishReticle(_ valid: Bool) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.screenReticle.layer.borderColor = (valid ? UIColor.systemGreen : UIColor.white).cgColor
            self.screenReticle.accessibilityLabel = valid ? "Valid surface hit" : "No valid surface hit"
        }
    }

    private func setText(_ text: String, on label: UILabel) {
        DispatchQueue.main.async {
            if label.text != text { label.text = text }
        }
    }

    private func showFatalError(_ message: String) {
        DispatchQueue.main.async { [weak self] in
            let alert = UIAlertController(title: "AR unavailable", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            self?.present(alert, animated: true)
        }
    }

    // MARK: - Interface

    private func buildInterface() {
        view.backgroundColor = .black
        sceneView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(sceneView)
        NSLayoutConstraint.activate([
            sceneView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            sceneView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            sceneView.topAnchor.constraint(equalTo: view.topAnchor),
            sceneView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        configureButton(poseButton, title: "Pose info", action: #selector(togglePose))
        configureButton(resetButton, title: "Reset", action: #selector(resetTapped))
        poseLabel.text = "Position: —\nQuaternion (x, y, z, w): —\nTODO 1"
        poseLabel.isHidden = true
        statusLabel.text = "Initializing AR tracking…"
        instructionLabel.text = "Aim at a surface and tap to select point 1"
        measurementLabel.text = "Distance: —"

        let topStack = UIStackView(arrangedSubviews: [statusLabel, poseButton, poseLabel])
        let bottomStack = UIStackView(arrangedSubviews: [instructionLabel, measurementLabel, resetButton])
        [topStack, bottomStack].forEach {
            $0.axis = .vertical
            $0.spacing = 8
            $0.alignment = .center
            $0.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview($0)
        }
        topStack.alignment = .leading

        screenReticle.translatesAutoresizingMaskIntoConstraints = false
        screenReticle.isUserInteractionEnabled = false
        screenReticle.layer.cornerRadius = 24
        screenReticle.layer.borderWidth = 3
        screenReticle.layer.borderColor = UIColor.white.cgColor
        screenReticle.isAccessibilityElement = true
        screenReticle.accessibilityLabel = "No valid surface hit"
        view.addSubview(screenReticle)

        NSLayoutConstraint.activate([
            topStack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            topStack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            topStack.trailingAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            bottomStack.leadingAnchor.constraint(greaterThanOrEqualTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
            bottomStack.trailingAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            bottomStack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            bottomStack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -12),
            screenReticle.widthAnchor.constraint(equalToConstant: 48),
            screenReticle.heightAnchor.constraint(equalToConstant: 48),
            screenReticle.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            screenReticle.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])

        sceneView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(sceneTapped)))
    }

    private func configureButton(_ button: UIButton, title: String, action: Selector) {
        var configuration = UIButton.Configuration.filled()
        configuration.title = title
        configuration.baseBackgroundColor = UIColor.black.withAlphaComponent(0.7)
        configuration.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 16, bottom: 10, trailing: 16)
        button.configuration = configuration
        button.addTarget(self, action: action, for: .touchUpInside)
    }

    @objc private func togglePose() { poseLabel.isHidden.toggle() }
    @objc private func resetTapped() { clearMeasurement() }
    @objc private func sceneTapped() {
        let hit = stateLock.locked { currentHitTransform }
        selectCurrentHit(hit) // TODO 3
    }
}

private final class OverlayLabel: UILabel {
    init(font: UIFont = .monospacedSystemFont(ofSize: 14, weight: .semibold)) {
        super.init(frame: .zero)
        self.font = font
        textColor = .white
        backgroundColor = UIColor.black.withAlphaComponent(0.68)
        numberOfLines = 0
        textAlignment = .center
        layer.cornerRadius = 8
        layer.masksToBounds = true
        translatesAutoresizingMaskIntoConstraints = false
        setContentHuggingPriority(.required, for: .vertical)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not used") }

    override func drawText(in rect: CGRect) {
        super.drawText(in: rect.insetBy(dx: 10, dy: 7))
    }

    override var intrinsicContentSize: CGSize {
        let size = super.intrinsicContentSize
        return CGSize(width: size.width + 20, height: size.height + 14)
    }
}

private extension NSLock {
    func locked<T>(_ body: () throws -> T) rethrows -> T {
        lock()
        defer { unlock() }
        return try body()
    }
}
