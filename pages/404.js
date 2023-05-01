// pages/404.js

import styles from '../styles/404.module.css';
import { useEffect, useState } from "react";

export default function Custom404({message}) {

  return (
    <div className={styles.message}>
      error 404
    </div>
  );
}

export async function getStaticProps () {

  return {
    props: {
      bodyClass: "body-404"
    }
  };
}