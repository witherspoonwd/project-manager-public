// next js imports
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

// react js imports
import {useState, useEffect} from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/home.module.css';

export default function Home({subtitle}) {

  return (
    <div>
      <Head> 
        <title>project manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <p className={mainStyles.title}> project manager</p>

      <div className={mainStyles.menuList}>
        <ul>
          <li><Link className={styles.menuButton} href="/songs">songs</Link></li>
          <li><Link className={styles.menuButton} href="/notepad">notepad</Link></li>
          <li><Link className={styles.menuButton} href="/sketchbook">sketchbook</Link></li>
          <li><Link className={styles.menuButton} href="/schedule">schedule</Link></li>
          {/* <li><Link className={styles.menuButton} href="/projects">projects</Link></li> */}
          <li><Link className={styles.menuButton} href="/microblog">microblog</Link></li>
          <li><Link className={styles.menuButton} href="/links">links</Link></li>
        </ul>
      </div>


      <p className={mainStyles.bigButton}><Link className={styles.homeButton} href="/index.php">exit to home</Link></p>

      <p className={mainStyles.copyright}>© Example Copyright Message. All rights reserved.</p>


    </div>
  );
}

export async function getStaticProps () {

  return {
    props: {
      bodyClass: "body-index"
    },
  };
}
