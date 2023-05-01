// next js imports
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';

// react js imports
import {useState, useEffect, useRef } from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/schedule.module.css';

// component imports
const DueDateTimer = dynamic(() => import('/components/ddtimer'), {
  ssr: false
});

const HoursWorkedTimer = dynamic(() => import('/components/hwtimer'), {
  ssr: false
});

export default function Home({posts, post, newBool, actionPass}) {

  let root;

  if (post) {
    root = <SinglePostBody post={post}/>;
  }

  else if (newBool == 1){
    root = <NewPoster />
  }

  else {
    root = <ScheduleIndexBody actionPass={actionPass} posts={posts}/>;
  }
  return root;
}

function ScheduleIndexBody(props) {

  return(
    <div>
      <Head>
        <title>schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className={`${mainStyles.title} ${styles.title}`}>
      schedule
      </div>
      <br/>

      <div className={styles.contentTable}>
        <table>
          <tbody>
            <tr key="schedule-header-row">
              <th key="schedule-header-due-date">due date</th>
              <th key="schedule-header-item">item</th>
            </tr>
            {props.posts.map((item, index) => (
              <PostIndex key={index} date={item.date} title={item.title} refID={item.refID} isClocked={item.clocked} isPastDue={item.pastDue} isComplete ={item.isComplete}/>
            ))}
          </tbody>
        </table>
      </div>
      <br/>

      <Link href={"/schedule?new=1"} className={`${mainStyles.bigButton} ${styles.backButton}`}>new item</Link> <br/>
      <Link href="/"className={`${mainStyles.bigButton} ${styles.backButton}`}>exit</Link>
      <br />
      <br />
      <br />
      <HiddenButton select={props.select}/>
    </div>
  )
}

// function component for displaying a table row with date and title of schedule post
function PostIndex(props) {

  let linkClass = styles.normal;

  if (props.isPastDue && props.isClocked) {
    linkClass = styles.clockMix;
  }
  
  else if (props.isComplete){
    linkClass = styles.itemComplete;
  }

  else if (props.isClocked) {
    linkClass = styles.clocked;
  }

  else if (props.isPastDue){
    linkClass = styles.pastDue;
  }


  return (
    <tr className={styles.tableRow} key={props.date}>
      <td>{ props.date }</td>
      <td><Link className={linkClass} href={"/schedule?refid=" + props.refID}>{ props.title }</Link></td>
    </tr>
  );
}

// hidden button for switching to "viewall" mode
function HiddenButton(props) {
  // get viewall from url
  const router = useRouter();
  const { viewall } = router.query;

  let linkPrepend = "/schedule";

  if (viewall == "1"){
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend}>back to normal</Link></div>;
  }

  else {
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend + "?viewall=1"}>back to viewall</Link></div>;
  }
}

function SinglePostBody(props) {
  const [completeState, setCompleteState] = useState(props.post.isComplete);

  const stateUpdate = (newState) => {
    //console.log('stateUpdate called with', newState);
    setCompleteState(newState);
  }

  return(
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <SinglePostContent completeState={completeState} post={props.post} />

      <SinglePostClocker completeState={completeState} post={props.post} />

      <SinglePostStateManager stateUpdate={stateUpdate} completeState={completeState} refid={props.post.refid} />

      <p className={`${styles.return}`}>
          <Link href="/schedule">back to list</Link>
      </p>
    </div>
  )
}

function SinglePostContent(props){
  // hella global states
  const [hasLoaded, setHasLoaded] = useState(false);

  // states for calling components and dynamic strings
  const [message, setMessage] = useState(false);

  // states for inputs
  const [postContent, setPostContent] = useState({
    title: props.post.title,
    description: props.post.content,
    dueDate: props.post.dateDue
  });
  const [postContentTimeout, setPostContentTimeout] = useState(null);

  // postContent timeout for autosave
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      return;
    }

    if (postContentTimeout){
      clearTimeout(postContentTimeout);
    }

    const dueDateObj = new Date(postContent.dueDate);
    let newTimeoutId;

    // if due dates messed up, do not call api
    if (!isNaN(dueDateObj.getTime())) {
      newTimeoutId = setTimeout(() => {
        backendPostContentUpdate(postContent.title, postContent.description, postContent.dueDate);
        console.log(postContent.dueDate);
      }, 1500);
    }

    setPostContentTimeout(newTimeoutId);

    return () => clearTimeout(newTimeoutId);
  }, [postContent]);

  // these handle data that is input into the form by updating their state
  const handleContentChange = (event) => {
    const {name, value} = event.target;

    let dynamicValue = value;

    if (name === "dueDate"){
      dynamicValue = new Date(value);
    }

    setPostContent(prevValues => ({
      ...prevValues,
      [name]: dynamicValue,
    }));
  };

  async function backendPostContentUpdate(title, description, dueDate) {

    if (title == ""){
      setMessage(null);
      setMessage(<MessageBox message="no title passed. try again."/>);
      // this timeout lets it be displayed multiple times
      setTimeout(function() {
        setMessage(null);
      }, 4000); // Wait 2 seconds before executing the function
      return;
    }

    let newDate = new Date(dueDate);
    newDate = newDate.toISOString();
    
    let respMessage = "temp";

    const payload = {
      title: title,
      content: description,
      duedate: dueDate,
      refid: props.post.refid
    };

    //console.log(payload);

    // Call your API to update the database with the new text
    try {
      const response = await fetch('/api/schedule/post/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok){
        respMessage = "changes saved.";
      }

      else {
        respMessage = "erm. title and description fail!";
      }
    }

    catch (error) {
      respMessage = "erm. title and description fail!";
    }

    setMessage(null);
    setMessage(<MessageBox message={respMessage}/>);

    // this timeout lets it be displayed multiple times
    setTimeout(function() {
      setMessage(null);
    }, 4000); // Wait 2 seconds before executing the function
  }

  return (
    <div>
      <Head>
        <title>{postContent.title}</title>
      </Head>

      <label>title:</label>
      <br/>
      <textarea className={styles.textarea} rows="1" cols="45" style={{resize: 'none'}} name="title" value={postContent.title} onChange={handleContentChange} />
      <br/>
      <br/>
      <label>content:</label><br/>
      <textarea className={styles.textarea} rows="18" cols="45" name="description" value={postContent.description} onChange={handleContentChange} />
      <br/>
      <br/>
      <label>due date:</label><br/>
      <input className={styles.input} type="datetime-local" name="dueDate" value={dateToDatetimeLocal(postContent.dueDate)} onChange={handleContentChange} />
      <br/>
      {!props.completeState && <DueDateTimer dueDate={postContent.dueDate}/>}
      {message}
    </div>
  )
}

function SinglePostClocker(props){

  const [clockInBool, setClockInBool] = useState(false);
  const [clockInStatusText, setclockInStatusText] = useState("not clocked in");
  const [clockInLinkText, setclockInLinkText] = useState("clock in");
  const [clockInTime, setClockInTime] = useState(props.post.lastClockIn);

  useEffect(() => {
    if (clockInTime) {
      setclockInStatusText("clock in time: " + dispLocalDate(clockInTime));
      setclockInLinkText("clock out");
      setClockInBool(true);
    }
    else {
      setclockInStatusText("not clocked in");
      setclockInLinkText("clock in");
      setClockInBool(false);
    }
  }, [clockInTime]);

  const [hoursElapsed, setHoursElapsed] = useState(props.post.hoursElapsed);

  const clockCycle = async () => {
    const apiUrl = 'http://localhost:3000/api/schedule/post/clock/' + props.post.refid;
    const response = await fetch(apiUrl, {
      method: 'POST'
    });

    const get = await response.json();

    setClockInTime(get.clockTime);

    if (get.hoursElapsed){
      setHoursElapsed(get.hoursElapsed);
    }
  };

  useEffect(() => {
    async function pullHoursElapsed() {
      const apiUrl = 'http://localhost:3000/api/schedule/post/clock/query/' + props.post.refid;
      const response = await fetch(apiUrl, {
        method: 'POST'
      });

      const get = await response.json();
      setHoursElapsed(get.hoursElapsed);

      if (props.completeState){
        setclockInStatusText("not clocked in");
        setclockInLinkText("clock in");
        setClockInBool(false);
      }
    }
    pullHoursElapsed();
  }, [props.completeState]);

  return (
    <div> 
      <div className={styles.clockContainer}>
        <HoursWorkedTimer hoursElapsed={hoursElapsed} timerActive={!clockInBool && !props.completeState}/>
        {!props.completeState && <p className={`${mainStyles.notop} ${mainStyles.nobottom}`}>{clockInStatusText}</p>}
        {!props.completeState && <p className={`${styles.clockLink} ${mainStyles.notop}`}>
          <Link onClick={clockCycle} href="#">{clockInLinkText}</Link>
        </p>}
      </div>
    </div>
  );
}

function SinglePostStateManager(props) {

  const [completeButtonText, setCompleteButtonText] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (props.completeState == true){
      setCompleteButtonText("reopen item");
    }

    else {
      setCompleteButtonText("mark as complete");
    }
  }, [props.completeState]);

  const openDelete = () => {
    setModal(<DeleteModal onClick={closeDelete} refid={props.refid}/>);
  };

  const closeDelete = () => {
    setModal(null);
  }

  const handleStateToggle = async () => {
    //console.log("toggle init");
    const apiUrl = 'http://localhost:3000/api/schedule/post/state/toggle/' + props.refid;
    const response = await fetch(apiUrl, {
      method: 'POST'
    });

    const get = await response.json();

    if (get.action == "close") {
      props.stateUpdate(true);
      //console.log("called with true");
    }

    else if (get.action == "reopen") {
      props.stateUpdate(false);
      //console.log("called with false");
    }

    //setClockInTime(get.clockTime);
  }
  
  return (
    <div className={styles.controlContainer}>
      <p className={`${styles.completeMarkButton} ${mainStyles.nobottom}`}>
        <Link onClick={handleStateToggle} href="#">{completeButtonText}</Link>
      </p>
      <p className={`${styles.scary} ${mainStyles.notop} ${mainStyles.nobottom}`}>
        <Link onClick={openDelete} href="#">delete item</Link>
      </p>

      {modal}
    </div>
  )
}

function NewPoster(props){
  // states for inputs
  const [postContent, setPostContent] = useState({
    title: "",
    description: "",
    dueDate: getElevenFiftyNine()
  });

  const [message, setMessage] = useState(null);

  const router = useRouter();

  // these handle data that is input into the form by updating their state
  const handleContentChange = (event) => {
    const {name, value} = event.target;

    let dynamicValue = value;

    if (name === "dueDate"){
      console.log("due date detected");
      dynamicValue = new Date(value);
    }

    setPostContent(prevValues => ({
      ...prevValues,
      [name]: dynamicValue,
    }));
  };

  async function handleSubmit(title, description, dueDate) {
    event.preventDefault(); // don't want the default redirects

    if (title == ""){
      setMessage(null);
      setMessage(<MessageBox message="no title set. try again."/>);
      // this timeout lets it be displayed multiple times
      setTimeout(function() {
        setMessage(null);
      }, 2000); // Wait 2 seconds before executing the function
      return;
    }

    let newDate = new Date(dueDate);
    newDate = newDate.toISOString();
    
    let respMessage = "temp";

    const payload = {
      title: title,
      content: description,
      duedate: dueDate,
    };

    //console.log(payload);

    // Call your API to update the database with the new text
    try {
      const response = await fetch('/api/schedule/post/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const get = await response.json();

      console.log(get);

      if (get.postSuccess == "true"){
        const refid = get.refid;

        router.push({
          pathname: '/schedule',
          query: {
            refid: refid
          },
        });
      }
    }

    catch (error) {
      respMessage = "complete error calling api.";
    }
  }

  return (
    <form onSubmit={(event) => handleSubmit(postContent.title, postContent.description, postContent.dueDate)}>
      <Head>
        <title>we do a little posting...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <label>title:</label>
      <br/>
      <textarea className={styles.textarea} rows="1" cols="45" style={{resize: 'none'}} name="title" value={postContent.title} onChange={handleContentChange} />
      <br/>
      <br/>
      <label>content:</label><br/>
      <textarea className={styles.textarea} rows="18" cols="45" name="description" value={postContent.description} onChange={handleContentChange} />
      <br/>
      <br/>
      <label>due date:</label><br/>
      <input className={styles.input} type="datetime-local" name="dueDate" value={dateToDatetimeLocal(postContent.dueDate)} onChange={handleContentChange} />
      <br/>
      <br />
      <input className={styles.input} type="submit" value="post!" />

      {message}

      <p class={styles.return}>
        <Link href="/schedule">erm, nevermind</Link>
      </p>
    </form>
  );
}

function DeleteModal(props) {

  // state for redirect variable
  const [redirect, setRedirect] = useState(null);

  let postID = String(props.refid);

  // function that actually makes the call to delete and calls the redirect
  const handleDelete = async () => {
    const apiUrl = 'http://localhost:3000/api/schedule/post/delete/' + postID;
    const response = await fetch(apiUrl);
    const get = await response.json();

    setRedirect(<RedirectComponent deleteSuccess={get.deleteSuccess}/>);
  };

  return (
    <div className={styles.fullScreenModal}>
      {redirect}
      <div className={styles.deleteBox}>
        <p>
          confirm deletion?
        </p>
        <p className={`${styles.scary} ${styles.scaryLink}`}>
          <a onClick={handleDelete}>YES. DELETE IT. NOW.</a><br/>
        </p>
        <p className={styles.return}>
          <Link href="#" onClick={props.onClick}>wait no, never mind</Link>
        </p>
        
      </div>
    </div>
  )
}

// component used to redirect passing information for both posting and deleting
function RedirectComponent(props) {
  const router = useRouter();

  // check for relevant props
  const fileSuccess = props.fileSuccess || false;
  const postSuccess = props.postSuccess || false;
  const deleteSuccess = props.deleteSuccess || "none";

  if (props.editRef){
    router.push({
      pathname: '/schedule',
      query: {
        refid: props.editRef
      },
    });
  }

  // if were posting, pass relevant props to root page
  else if (deleteSuccess === "none"){
    router.push({
      pathname: '/schedule',
      query: {
        fileSuccess, 
        postSuccess, 
        forcedRefresh: true 
      },
    });
  }

  // same if were deleting
  else {
    router.push({
      pathname: '/schedule',
      query: {
        deleteSuccess,
        forcedRefresh: true,
      },
    });
  }
  
  // Return null if theres no props
  return null;
}

// function component for displaying a message. automatically dissapears due to it's css
function MessageBox({ message }) {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

function getElevenFiftyNine(){
  const now = new Date(); // Get current datetime
  const year = now.getFullYear(); // Get current year
  const month = now.getMonth(); // Get current month
  const day = now.getDate(); // Get current day
  const adjustedTime = new Date(year, month, day, 23, 59, 0); // Set time to 11:59pm
  return adjustedTime;
}

function dateToDatetimeLocal(input) {
  let date = new Date(input);

  // Get the date and time components from the Date object
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  
  // Format the datetime-local string as yyyy-mm-ddThh:mm
  const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  // Return the datetime-local string
  return datetimeLocal;
}

function dispLocalDate(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  let hour = date.getHours();
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedDate = `${month}.${day}.${year} ${hour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  return formattedDate;
}

export async function getServerSideProps (context) {

  // get query from context
  const {query} = context;

  let viewall = query.viewall || false;
  let refid = query.refid || false;
  let newBool = query.new || false;

  let apiUrl, response;

  let posts = null, post = null, numPosts = null;

  // gen actionPass, which is relevant for what message to display from the PostIndexBody
  let actionPass = [];
  actionPass.push(query.fileSuccess);
  actionPass.push(query.postSuccess);
  actionPass.push(query.deleteSuccess);
  actionPass.push(query.errorSuccess);
  actionPass.push(query.forcedRefresh);

  if (viewall){
    apiUrl = 'http://localhost:3000/api/schedule/posts';
    response = await fetch(apiUrl, {
      headers: {
        viewall: 1,
      }
    });
    posts = await response.json();
  }
  
  else if (refid) {
    apiUrl = 'http://localhost:3000/api/schedule/post/' + String(refid);
    response = await fetch(apiUrl);
    post = await response.json();
  }

  else {
    apiUrl = 'http://localhost:3000/api/schedule/posts';
    response = await fetch(apiUrl);
    posts = await response.json();
  }

  // stringify my actionPass array
  actionPass = JSON.stringify(actionPass);

  return {
    props: {
      posts,
      post,
      newBool,
      actionPass,
      bodyClass: "body-schedule"
    }
  };
}
