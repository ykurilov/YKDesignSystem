// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "YKDesign",
    defaultLocalization: "ru",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "YKDesign", targets: ["YKDesign"]),
    ],
    dependencies: [
        .package(url: "https://github.com/phosphor-icons/swift", from: "2.1.0"),
    ],
    targets: [
        .target(
            name: "YKDesign",
            dependencies: [.product(name: "PhosphorSwift", package: "swift")]
        ),
        .testTarget(
            name: "YKDesignTests",
            dependencies: ["YKDesign"],
            resources: [.copy("Fixtures")]
        ),
    ]
)
