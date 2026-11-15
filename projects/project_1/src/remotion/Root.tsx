import { Composition, Audio } from 'remotion';
import { DopaiMintVideo } from './DopaiMintVideo';
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

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="NasaHackathon1080x700"
        component={NasaHackathonComposition}
        width={1080}
        height={700}
        fps={30}
        durationInFrames={855}
      />
      <Composition
        id="NasaHackathon1080p"
        component={NasaHackathonComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={855}
      />
      <Composition
        id="DopaiMintFullLaunch1080p"
        component={FullLaunchComposition}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={1620}
      />
      <Composition
        id="CyberpunkTechIntro1080p"
        component={StandaloneIntroWithAudio}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={165}
      />
      <Composition
        id="HypeReelStandalone"
        component={HypeReelScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={90}
      />
      <Composition
        id="WarmPaperPitch1080p"
        component={WarmPaperPitchScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={360}
      />
    </>
  );
}
