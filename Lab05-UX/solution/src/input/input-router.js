export function createInputRouter() {
  const input={mode:'desktop',connected:true,tracking:true,pointingPose:null,gripPose:null};
  return {
    input,
    setDesktop(desktop){input.mode='desktop';input.connected=true;input.tracking=true;input.pointingPose=desktop.node;input.gripPose=desktop.grip;},
    setImmersive(xr){input.mode='immersive';input.connected=!!xr.active;input.tracking=!!xr.active;input.pointingPose=xr.pointing;input.gripPose=xr.grip;},
    invalidate(){input.connected=false;input.tracking=false;input.pointingPose=null;input.gripPose=null;},
  };
}
