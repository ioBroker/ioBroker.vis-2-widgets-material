import React, { useEffect, useRef, useState } from 'react';
import { Lottie, LottieDirection, type LottieHandle } from 'lottie-react';
import animationDoor from './animationDoor.json';

interface DoorAnimationProps {
    open: boolean;
    size?: number;
}

const DoorAnimation = (props: DoorAnimationProps): React.ReactNode => {
    const [open, setOpen] = useState(false);
    const ref = useRef<LottieHandle>(null);

    useEffect(() => {
        setOpen(props.open);
        if (ref.current) {
            if (props.open) {
                ref.current.setDirection(LottieDirection.forward);
                ref.current.seek(0);
                ref.current.playSegments([0, 24]);
            } else {
                ref.current.setDirection(LottieDirection.reverse);
                ref.current.seek(24);
                ref.current.playSegments([24, 0]);
            }
        }
        // ref.current?.stop();
    }, [props.open]);

    return (
        <Lottie
            src={animationDoor}
            onClick={() => setOpen(!open)}
            lottieRef={ref}
            autoplay={false}
            loop={false}
            style={{ height: props.size || 120 }}
        />
    );
};

export default DoorAnimation;
