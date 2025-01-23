import { SolaAgent } from "../../index";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

export async function transfer(
    agent: SolaAgent,
    to: string,
    amount: number,
    token?: string,
  ): Promise<string> {
    try {
      let tx: string;
        if (!token) {
            let balance = await agent.connection.getBalance(
                agent.wallet_address)
            if (balance / LAMPORTS_PER_SOL - 0.01 < amount) {
              return 'tell the user that they dont have enough balance and ask them to fund their account'
            }
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: agent.wallet_address,
            toPubkey: new PublicKey(to),
            lamports: amount * LAMPORTS_PER_SOL,
          }),
        );

        tx = await agent.connection.sendTransaction(transaction, [agent.keypair]);
      } else {

        let sourceAccount = await getAssociatedTokenAddress(
            new PublicKey(token),
        new PublicKey(agent.wallet_address)
            );

        let destinationAccount = await getOrCreateAssociatedTokenAccount(
            agent.connection,
            agent.keypair,
            new PublicKey(token),
            new PublicKey(to)
        );


        const decimals = (await getMint(agent.connection, new PublicKey(token))).decimals;

        const transaction = new Transaction().add(
        createTransferInstruction(
        sourceAccount,
        destinationAccount.address,
        agent.wallet_address,
        amount * Math.pow(10, decimals),
          ),
        );
        tx = await agent.connection.sendTransaction(transaction, [agent.keypair]);
          
      }
      return tx;
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }