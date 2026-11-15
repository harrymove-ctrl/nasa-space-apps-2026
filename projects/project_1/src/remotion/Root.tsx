import { Composition, Audio } from 'remotion';
import {
  DopaiMintVideo,
  FULL_LAUNCH_FRAMES,
  NASA_HACKATHON_FRAMES,
} from './DopaiMintVideo';
import { CyberpunkTechIntro } from './scenes/CyberpunkTechIntro';
import { HypeReelScene } from './scenes/HypeReelScene';
import { WarmPaperPitchScene } from './scenes/WarmPaperPitchScene';
import { resolveAssetUrl } from './palette';

function NasaHackathonComposition() {
  return <DopaiMintVideo variant="nasa-hackathon" />;
}

function FullLaunchComposition() {
  return <DopaiMintVideo variant="full-launch" />;
}

function StandaloneIntroWithAudio() {
  return (
    <>
      <Audio src={resolveAssetUrl('/audio/sfx-scanner.mp3')} volume={0.68} />
      <CyberpunkTechIntro compact={false} showGameBotHook />
    </>
  );
}

function StandaloneWarmPaperPitch() {
  return <WarmPaperPitchScene compactSummary={false} />;
}

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="DopaiMintFullLaunch1080p"
        component={FullLaunchComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={FULL_LAUNCH_FRAMES}
      />
      <Composition
        id="DopaiMintFullLaunch1080x700"
        component={FullLaunchComposition}
        width={1080}
        height={700}
        fps={30}
        durationInFrames={FULL_LAUNCH_FRAMES}
      />
      <Composition
        id="NasaHackathon1080p"
        component={NasaHackathonComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={NASA_HACKATHON_FRAMES}
      />
      <Composition
        id="NasaHackathon1080x700"
        component={NasaHackathonComposition}
        width={1080}
        height={700}
        fps={30}
        durationInFrames={NASA_HACKATHON_FRAMES}
      />
      <Composition
        id="CyberpunkTechIntro1080p"
        component={StandaloneIntroWithAudio}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={210}
      />
      <Composition
        id="HypeReelStandalone"
        component={HypeReelScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
      />
      <Composition
        id="WarmPaperPitch1080p"
        component={StandaloneWarmPaperPitch}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={540}
      />
    </>
  );
}
