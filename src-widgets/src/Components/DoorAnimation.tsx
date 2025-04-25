import type { LottieRefCurrentProps } from 'lottie-react';
import Lottie, { LottieRef } from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import animationDoor from './animationDoor.json';

interface DoorAnimationProps {
    open: boolean;
    size?: number;
}

const DoorAnimation = (props: DoorAnimationProps): React.ReactNode => {
    const [open, setOpen] = useState(false);
    const ref = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        setOpen(props.open);
        if (ref.current) {
            if (props.open) {
                ref.current.setDirection(1);
                ref.current.goToAndStop(0, true);
                ref.current.playSegments([0, 24], true);
                // ref.current.play();
            } else {
                ref.current.setDirection(-1);
                ref.current.goToAndStop(24, true);
                ref.current.playSegments([24, 0], true);
                // ref.current.play();
            }
        }
        // ref.current?.stop();
    }, [props.open]);

    return (
        <Lottie
            animationData={animationDoor}
            onClick={() => setOpen(!open)}
            lottieRef={ref}
            autoPlay={false}
            loop={false}
            // start={200}
            style={{ height: props.size || 120 }}
        />
    );
};

export default DoorAnimation;
