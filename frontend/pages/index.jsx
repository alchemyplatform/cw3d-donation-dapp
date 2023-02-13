import styles from "../styles/Home.module.css";
import Panels from "../components/panels";
import DonationBox from "../components/DonationBox";
import contract from "../contractAbi/DonationContract.json";

export default function Home() {
  console.log(contract.abi);
  return (
    <div>
      <main className={styles.main}>
        <DonationBox
          pContractAddress="0x63470f675dC2732b85C95B82F417407Db4B483ce"
          pAbi={contract.abi}
        />
      </main>
    </div>
  );
}
