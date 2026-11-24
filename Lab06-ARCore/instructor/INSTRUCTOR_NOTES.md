# Instructor-only notes — do not distribute with the student starter

The student project intentionally has four incomplete functions in `HelloArRenderer.kt`. A reference implementation should make these minimal changes:

1. `updateCameraPose`: guard on `TrackingState.TRACKING`; format `camera.pose.translation` and `rotationQuaternion`; publish the string.
2. `findCenterPlaneHit`: call `frame.hitTest(width / 2f, height / 2f).firstOrNull { val p = it.trackable as? Plane; p?.trackingState == TRACKING && p.isPoseInPolygon(it.hitPose) }`; publish validity; return the hit.
3. `selectCurrentHit`: if `hit != null && anchors.size < 2`, add `hit.createAnchor()` and publish the next state instruction.
4. `distanceMeters`: validate both arrays have at least three values and return `sqrt((a[0]-b[0]).pow(2) + …)`. In `updateDistanceAndLine`, require two poses, read both translations, compute/publish the result, and call `drawLine`.

Recommended pure-function tests: `(0,0,0)→(3,4,0) == 5`, identical points `== 0`, and a 3D case such as `(1,2,3)→(2,4,5) == 3` within a small float tolerance.

The reference code was not placed in the student tree so accidental distribution does not reveal the solution. On-device validation remains necessary for hit selection, anchor tracking, and reset behavior.
