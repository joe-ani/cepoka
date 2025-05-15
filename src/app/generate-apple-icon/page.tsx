"use client";

import AppleIconGenerator from '../Components/AppleIconGenerator';

export default function GenerateAppleIcon() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Generating Apple Icon</h1>
        <p>The apple-icon.png file will be downloaded automatically.</p>
        <AppleIconGenerator />
      </div>
    </div>
  );
}
