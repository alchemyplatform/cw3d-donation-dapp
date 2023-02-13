import { useEffect, useState } from "react";
import { Contract, Utils } from "alchemy-sdk";
import { useAccount, useSigner, useProvider } from "wagmi";
import styles from "../styles/DonationBox.module.css";
import Head from "next/head";

export default function DonationBox({ pContractAddress, pAbi }) {
  const [name, setName] = useState();
  const [message, setMessage] = useState();
  const [memos, setMemos] = useState();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const { isDisconnected } = useAccount();

  const donate = async () => {
    try {
      if (signer) {
        const donationContract = new Contract(pContractAddress, pAbi, signer);
        const coffeeTx = await donationContract.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: Utils.parseEther("0.001") }
        );
        await coffeeTx.wait();

        setName("");
        setMessage("");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getMemos = async () => {
    try {
      if (provider) {
        const buyMeACoffee = new Contract(pContractAddress, pAbi, provider);
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000).toDateString(),
          message,
          name,
        },
      ]);
    };
    if (signer) {
      buyMeACoffee = new Contract(pContractAddress, pAbi, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);

      return () => {
        if (buyMeACoffee) {
          buyMeACoffee.off("NewMemo", onNewMemo);
        }
      };
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.donation_panel}>
        <h1>Buy me a coffee!</h1>

        <div className={styles.form}>
          <div style={{ flexGrow: 0.4 }}>
            <div class="formgroup">
              <label>Name</label>
              <br />

              <input
                className={styles.input}
                id="name"
                type="text"
                placeholder="anon"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <br />
            <div class="formgroup">
              <label>Send Albert a message</label>
              <br />

              <textarea
                className={styles.input}
                rows={8}
                placeholder="Enjoy your coffee!"
                id="message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                required
              ></textarea>
            </div>
          </div>

          <div className={styles.button_container}>
            <button
              className={styles.donation_button}
              type="button"
              onClick={donate}
              disabled={isDisconnected}
            >
              {isDisconnected
                ? "Connect your wallet"
                : "Send 1 Coffee for 0.001ETH"}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.memos_panel}>
        <h1>Memos received</h1>
        <div className={styles.scroll_box}>
          {memos &&
            memos.map((memo, idx) => {
              return (
                <div key={idx} className={styles.memo}>
                  <p className={styles.memo_message}>"{memo.message}"</p>
                  <p>
                    From: <strong>{memo.name}</strong> at <strong>
                      {new Date(Number(memo.timestamp * 1000)).toDateString()}
                    </strong>
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
