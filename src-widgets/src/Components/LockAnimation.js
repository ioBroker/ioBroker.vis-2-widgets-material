import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import animationLock from './animationLockGray.json';

function rgb2array(color) {
    color = color.replace(/^#/, '');
    if (color.length === 3) {
        color = color.replace(/./g, '$&$&');
    }
    let result = [0, 0, 0, 1];
    if (color.startsWith('rgba')) {
        const rgb = color.match(/\d+/g);
        if (rgb) {
            result = rgb.map(x => parseInt(x, 10) / 255).concat([1]);
            return JSON.stringify(result);
        }
    } else if (color.startsWith('rgb')) {
        const rgb = color.match(/\d+/g);
        if (rgb) {
            result = rgb.map(x => parseInt(x, 10) / 255).concat([1]);
            result.push(1);
            return JSON.stringify(result);
        }
    } else {
        const rgb = color.match(/.{2}/g);
        if (rgb) {
            result = rgb.map(x => parseInt(x, 16) / 255);
            result.push(1);
        }
    }

    return JSON.stringify(result);
}

const LockAnimation = props => {
    const [open, setOpen] = useState(false);
    const [json, setJson] = useState(animationLock);
    const ref = useRef(null);

    useEffect(() => {
        let text = JSON.stringify(animationLock);
        if (props.color) {
            text = text.replaceAll('[0.7,0.7,0.7,1]', rgb2array(props.color));
        }
        setJson(JSON.parse(text));
    }, [props.color]);

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
        animationData={json}
        onClick={() => setOpen(!open)}
        lottieRef={ref}
        autoPlay={false}
        loop={false}
        // start={200}
        style={{ height: props.size || 40 }}
    />;
};

export default LockAnimation;
