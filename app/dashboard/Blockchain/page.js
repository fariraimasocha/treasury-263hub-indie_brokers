"use client";
import React, { useEffect } from "react";
import BlockchainJS from "@ethereumjs/blockchain"; // blockchain manager
import { Block } from "@ethereumjs/block"; // for creating blocks
import Common from "@ethereumjs/common"; // network configuration

export default function BlockchainSimulator() {
  useEffect(() => {
    const runSimulation = async () => {
      try {
        // 1. Setup network configuration
        const common = new Common({ chain: "mainnet", hardfork: "london" });

        // 2. Create a blockchain instance
        const blockchain = await BlockchainJS.create({ common });
        console.log("Blockchain instance created.");

        // 3. Prepare block data
        const blockData = {
          header: {
            parentHash: Buffer.alloc(32), // dummy parent hash (32 bytes of zeros)
            number: 1, // block number (starting at 1)
            difficulty: BigInt(1), // trivial difficulty for simulation
          },
        };

        // Create a block instance from the dummy data
        const newBlock = Block.fromBlockData(blockData, { common });

        // 4. Insert the block into the blockchain
        await blockchain.putBlock(newBlock);
        console.log(
          "Block has been successfully added with hash:",
          newBlock.hash().toString("hex")
        );
      } catch (err) {
        console.error("Error in blockchain simulation:", err);
      }
    };

    // Run the blockchain simulation on component mount
    runSimulation();
  }, []);

  return (
    <div>Blockchain simulation running... Check your console for details.</div>
  );
}
