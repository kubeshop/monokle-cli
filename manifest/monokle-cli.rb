class MonokleCli < Formula
  desc "Monokle CLI analyzes your Kubernetes resources to quickly find misconfigurations."
  homepage "https://github.com/kubeshop/monokle-cli"
  license "MIT"

  version "VERSION"
  if Hardware::CPU.arm?
    url "ARM_URL"
    sha256 "ARM_SHA"
  else
    url "AMD_URL"
    sha256 "AMD_SHA"
  end

  def install
    bin.install "monokle"
  end
end
