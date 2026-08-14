// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MuscheCore",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "MuscheCore", targets: ["MuscheCore"]),
    ],
    targets: [
        .target(name: "MuscheCore"),
        .testTarget(name: "MuscheCoreTests", dependencies: ["MuscheCore"]),
    ]
)
