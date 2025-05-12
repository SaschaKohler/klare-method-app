#!/bin/bash
# Script to ensure Fastlane is properly installed and configured

echo "📱 Setting up Fastlane for EAS Build..."

# Check if Fastlane is already installed
if command -v fastlane &> /dev/null; then
    echo "✅ Fastlane is already installed: $(fastlane --version)"
else
    echo "🔄 Installing Fastlane..."
    
    # Make sure Ruby and RubyGems are up to date
    gem update --system
    
    # Install Fastlane
    gem install fastlane -N
    
    # Verify installation
    if command -v fastlane &> /dev/null; then
        echo "✅ Fastlane installed successfully: $(fastlane --version)"
    else
        echo "❌ Failed to install Fastlane. Check Ruby and RubyGems setup."
        exit 1
    fi
fi

# Add Fastlane to PATH if needed
if [[ ":$PATH:" != *"$(gem environment gemdir)/bin"* ]]; then
    echo "🔄 Adding Fastlane to PATH..."
    export PATH="$PATH:$(gem environment gemdir)/bin"
    echo "export PATH=\"\$PATH:$(gem environment gemdir)/bin\"" >> $HOME/.bashrc
    echo "export PATH=\"\$PATH:$(gem environment gemdir)/bin\"" >> $HOME/.zshrc
fi

echo "✅ Fastlane setup complete!"
