#!/bin/bash

echo "Cleaning Xcode workspace..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock

echo "Installing Pods..."
pod install

echo "Building with the correct schema..."
cd ..
npx expo run:ios --scheme klaremethode --device
