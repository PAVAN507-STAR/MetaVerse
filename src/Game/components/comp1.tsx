// app/game/page.tsx
import React, { useEffect, useRef } from "react";

const GameComponent: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const gameInstanceRef = useRef<any>(null);
  const isInitializing = useRef<boolean>(false);

  useEffect(() => {
    // Prevent multiple initializations if already created or in progress
    if (isInitializing.current) return;

    if (typeof window !== "undefined" && gameContainerRef.current) {
      isInitializing.current = true; // Mark initialization in progress

      Promise.all([import("phaser"), import("../scenes/room1")])
        .then(([Phaser, moduleRoom1]) => {
          const { AUTO, Game } = Phaser;
          const { room1 } = moduleRoom1;

          const config: Phaser.Types.Core.GameConfig = {
            type: AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: "game-container",
            backgroundColor: "#000000",
            scene: [room1],
            physics: {
              default: "arcade",
              arcade: {
                gravity: { x: 0, y: 0 },
                debug: false,
              },
            },
          };

          gameInstanceRef.current = new Game(config);
        })
        .catch((err) => {
          console.error("Error loading Phaser or the scene:", err);
        })
        .finally(() => {
          isInitializing.current = false; // Reset the flag regardless
        });
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={gameContainerRef} id="game-container" />;
};

export default GameComponent;
