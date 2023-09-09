import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import animationLock from './animationLock.json';

const LockAnimation = props => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        setOpen(props.open);
        if (ref.current) {
            if (props.open) {
                ref.current.goToAndStop(100, true);
                ref.current.playSegments([100, 160], true);
                // ref.current.play();
            } else {
                ref.current.goToAndStop(0, true);
                ref.current.playSegments([240, 300], true);
                // ref.current.play();
            }
        }
        // ref.current?.stop();
    }, [props.open]);
    return <Lottie
        animationData={animationLock}
        onClick={() => setOpen(!open)}
        lottieRef={ref}
        autoPlay={false}
        loop={false}
        // start={200}
        style={{ height: 40 }}
    />;
};

export default LockAnimation;
