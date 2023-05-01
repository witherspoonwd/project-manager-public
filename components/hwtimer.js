// react js imports
import {useState, useEffect, useRef } from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/schedule.module.css';

export default function HoursWorkedTimer(props) {
  const [timer, setTimer] = useState(props.hoursElapsed);
  const [timerId, setTimerId] = useState(false);
  const [timerActive, setTimerActive] = useState(props.timerActive);

  useEffect(() => {
    //console.log("timer is kill");
    clearInterval(timerId);
    setTimer(props.hoursElapsed);
    setTimerActive(props.timerActive);

    let interval;

    if (timerActive == true) {
      //console.log("timer starting");
      interval = setInterval(() => {
        setTimer(prevTimer => (parseFloat(prevTimer) + 0.01).toFixed(2));
      }, 36000);

      setTimerId(interval);
    }

    return () => clearInterval(interval);
  }, [props.timerActive, props.hoursElapsed]);



  return (
    <p className={mainStyles.nobottom}>
      hours worked on: {parseFloat(timer).toFixed(2)}
    </p>
  )
}