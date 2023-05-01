// react js imports
import {useState, useEffect, useRef } from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/schedule.module.css';

function padLeadingZeros(num, size) {
  let s = String(num);
  if ((s.length) == "1") {
    s = "0" + s;
  }

  return s;
}

function parseTimerDifference(date) {
  const dueDate = new Date(date).getTime();

  // Get today's date and time
  const currentDate = new Date().getTime();

  // Find the distance between now and the count down date

  let distance;

  if (dueDate > currentDate) {
    distance = dueDate - currentDate;
  } else {
    distance = currentDate - dueDate;
  }

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (Number.isNaN(days) || Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)){
    return ["invalid due date.", styles.scaryColor];
  }

  let timerClass = "";

  if (currentDate > dueDate) {
    timerClass = styles.scaryColor;
  }
  else if (hours <= 6 && days < 1) {
    timerClass = styles.warningColor;
  }

  // return time since
  return ([
    String(padLeadingZeros(days, 2) + ":" + padLeadingZeros(hours, 2) + ":" + padLeadingZeros(minutes, 2) + ":" + padLeadingZeros(seconds, 2)),
    timerClass
  ]
  );
}

export default function DueDateTimer(props){
  const [timer, setTimer] = useState(parseTimerDifference(props.dueDate)[0]);
  const [timerClass, setTimerClass] = useState(parseTimerDifference(props.dueDate)[1]);

  // start the timer
  useEffect(() => {
    const interval = setInterval(() => {
      const parsedArray = parseTimerDifference(props.dueDate);

      setTimer(parsedArray[0]);
      setTimerClass(parsedArray[1]);
    }, 1000);

    return () => clearInterval(interval);
  }, [props.dueDate]);

  return (
    <p className={styles.timerContainer}>
      time until due date:&nbsp;
      <span className={timerClass}>{timer}</span>
    </p>
  );
}
