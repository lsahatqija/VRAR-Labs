$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectFile = Join-Path $projectRoot 'ARMeasurement.xcodeproj\project.pbxproj'
$sourceFile = Join-Path $projectRoot 'ARMeasurement\ViewController.swift'
$infoFile = Join-Path $projectRoot 'ARMeasurement\Info.plist'

[xml]$info = Get-Content -Raw -LiteralPath $infoFile
if ($info.plist.dict.key -notcontains 'NSCameraUsageDescription') {
    throw 'Info.plist is missing NSCameraUsageDescription.'
}
if ($info.plist.dict.key -notcontains 'UIRequiredDeviceCapabilities') {
    throw 'Info.plist is missing UIRequiredDeviceCapabilities.'
}

$project = Get-Content -Raw -LiteralPath $projectFile
foreach ($requiredReference in @('AppDelegate.swift', 'ViewController.swift', 'Info.plist', 'ARKit.framework', 'SceneKit.framework')) {
    if (-not $project.Contains($requiredReference)) {
        throw "Xcode project is missing $requiredReference."
    }
}

$source = Get-Content -Raw -LiteralPath $sourceFile
foreach ($task in 1..4) {
    if (-not $source.Contains("TODO $task")) {
        throw "Student source is missing TODO $task."
    }
}
foreach ($requiredSymbol in @('updateCameraPose', 'findCenterPlaneHit', 'selectCurrentHit', 'updateDistanceAndLine', 'distanceMeters')) {
    if (-not $source.Contains($requiredSymbol)) {
        throw "Student source is missing $requiredSymbol."
    }
}

Write-Output 'ARKit student project structure verified.'
