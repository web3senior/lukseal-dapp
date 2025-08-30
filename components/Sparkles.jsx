
'use client'

import { useEffect, useState, useId } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function Sparkles({
    className,
    size = .5,
    minSize = null,
    density = 400,
    speed = .5,
    minSpeed = null,
    opacity = 1,
    direction = 'top',
    opacitySpeed = 3,
    minOpacity = null,
    color = '#000',
    mousemove = false,
    hover = false,
    background = 'transparent',
    options = {},
}) {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setIsReady(true);
        });
    }, []);
    const id = useId();
    const defaultOptions = {
        background: {
            color: {
                value: background,
            },
        },
        fullScreen: {
            enable: false,
            zIndex: 1,
        },
        fpsLimit: 300,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: 'push',
                },
                onHover: {
                    enable: hover,
                    mode: 'grab',
                    parallax: {
                        enable: mousemove,
                        force: 60,
                        smooth: 10,
                    },
                },
                resize: true,
            },
            modes: {
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 200,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: color,
            },
            move: {
                enable: true,
                direction,
                speed: {
                    min: minSpeed || speed / 130,
                    max: speed,
                },
                straight: true,
            },
            collisions: {
                absorb: {
                    speed: 2,
                },
                bounce: {
                    horizontal: {
                        value: 1,
                    },
                    vertical: {
                        value: 1,
                    },
                },
                enable: false,
                maxSpeed: 50,
                mode: 'bounce',
                overlap: {
                    enable: true,
                    retries: 0,
                },
            },
            number: {
                value: density,
            },
            opacity: {
                value: {
                    min: minOpacity || opacity / 10,
                    max: opacity,
                },
                animation: {
                    enable: true,
                    sync: false,
                    speed: opacitySpeed,
                },
            },
            size: {
                value: {
                    min: minSize || size / 1.5,
                    max: size,
                },
            },
        },
        detectRetina: true,
    };
    return (
        isReady && (
            <Particles id={id} options={defaultOptions} className={className} />
        )
    );
}