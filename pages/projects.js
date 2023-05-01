// next js imports
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic'

// react js imports
import {useState, useEffect, useRef, useCallback} from 'react';
import { Fragment } from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/projects.module.css';

// component imports
const DueDateTimer = dynamic(() => import('/components/ddtimer-projects'), {
  ssr: false
});

export default function Projects({post}) {
  return (
    <div className={styles.topContainer}>
      <InfoSection info={post}/>
      <ModuleSection />
    </div>
  )
}

function ModuleSection(props){
  return (
    <div className={styles.moduleSection}>
      &nbsp;
    </div>
  )
}

function InfoSection(props) {

  //const [hasLoaded, setHasLoaded] = useState(false);
  const [info, setInfo] = useState(props.info); //STATE TO STORE PROJECT INFO
  const [backendCall, setBackendCall] = useState(false); // STATE TO DETERMINE IF BACKEND CALL SHOULD BE RUN

  // STATE TO STORE "EDITMODE" ACTIVATED BOOL
  const [editMode, setEditMode] = useState(false);

  // state to pass down to components if the project is complete or not.
  const [completeState, setCompleteState] = useState(info.projectStatus);

  // useEffect to validate form data and call backend update api
  useEffect(() => {
    if (backendCall == true){
      // make sure valid numbers are passed to the songpage and notepad page variables.
      if (!isValidNumber(info.songPage) || !isValidNumber(info.notepadPage)){
        toggleEdit();
        setBackendCall(false);
        return;
      }

      const dueDateObj = new Date(info.dueDate);

      // make sure the duedate is valid before calling api.
      if (isNaN(dueDateObj.getTime())) {
        toggleEdit();
        setBackendCall(false);
        return;
      }

      backendUpdateInfo(info);
      setBackendCall(false);
    }
  }, [backendCall]);

  // toggle edit state
  const toggleEdit = useCallback(() => {
    setEditMode(currentEditMode => !currentEditMode);

    if (!editMode == false){
      setBackendCall(true);
    }
  }, [editMode]);

  // toggle completion status
  const toggleComplete = () => {
    if (info.projectStatus == true){
      setInfo(prevValues => ({
        ...prevValues,
        projectStatus: false,
        dateCompleted: null
      }));
      setCompleteState(false);
      setBackendCall(true);
    }

    else {
      setInfo(prevValues => ({
        ...prevValues,
        projectStatus: true,
        dateCompleted: new Date()
      }));
      setCompleteState(true);
      setBackendCall(true);
    }

    // if we're editing, exit from edit mode.
    if (editMode) {
      toggleEdit();
    }
  }


  // testerFunc. test function
  const testerFunc = () => 
  {
    console.log("testerFunc");
  };

  // handler for an info update
  const handleContentChange = (event) => {
    const {name, value} = event.target;

    let dynamicValue = value;

    if (name === "dueDate"){
      console.log("due date detected");
      dynamicValue = new Date(value);
    }

    else if ((name == "songPage" || name == "notepadPage") && value == ""){
      dynamicValue = null;
    }
    
    else if ((name == "songPage" || name == "notepadPage")){
      const parsedValue = parseInt(value);
      dynamicValue = isNaN(parsedValue) ? null : parsedValue;
    }

    setInfo(prevValues => ({
      ...prevValues,
      [name]: dynamicValue,
    }));
  };

  return (
    <div className={styles.infoSection}>
      <Head>
        <title>{info.title}</title>
      </Head>
      <Panel topPanel={true}> 
        <InfoButtons completeState={completeState} editMode={editMode} toggleEdit={toggleEdit} toggleComplete={toggleComplete} addNote={testerFunc}/>
        <InfoDisplay completeState={completeState} editMode={editMode} info={info} handleContentChange={handleContentChange}/>
        <DescriptionDisplay editMode={editMode} info={info} handleContentChange={handleContentChange}/>
      </Panel>

      {/* <NotesContainer /> */}
    </div>
  );
}

function InfoButtons(props){
  // buttons to pass to ButtonBox based on infoSection props
  let buttons = {
    ...!props.completeState && {editButton: {
        func: props.toggleEdit,
        text: props.editMode == true ? "save changes" : "edit info"
      },
    },
    markCompleteButton: {
      func: props.toggleComplete,
      text: props.completeState == true ? "reopen project" : "mark as complete"
    },
    addNoteButton: {
      func: props.addNote,
      text: "add note"
    },
  }

  return (
    <ButtonBox buttons={buttons} />
  )
}

function InfoDisplay(props){

  return (
    <div className={styles.infoBox}>
      {
        Object.keys(props.info).map((prop) => {
          // if were displaying the due date, we also need to display the due date timer
          if (prop == "dueDate"){
            return (
              <Fragment key={prop}>
                {!props.completeState && <DueDateTimer dueDate={props.info[prop]}/>}
                <InfoDisplayRow completeState={props.completeState} editMode={props.editMode} key={prop} asc={prop} title={deCamelCase(prop).toLowerCase() + ':'} content={props.info[prop]} handleContentChange={props.handleContentChange}/>
              </Fragment>
            );
          }
          else if (prop!="description" && prop!="refid") {
            return  <InfoDisplayRow editMode={props.editMode} key={prop} asc={prop} title={deCamelCase(prop).toLowerCase() + ':'} content={props.info[prop]} handleContentChange={props.handleContentChange}/>;
          }
        })
      }
    </div>
  )
}

function InfoDisplayRow(props){
  // elements for displaying content
  let contentDisp = props.content;
  let editElement;

  // make sure projectStatus bool is displayed as text
  if (props.asc == "projectStatus"){
    contentDisp = (contentDisp == false) ? "in progress" : "completed";
  }

  // if the project is complete, we don't need to display the due date
  if (props.completeState && props.asc == "dueDate"){
    return null;
  }

  // if statment for if we're editing or not.
  if (props.editMode == true){
    if ((contentDisp === null) && (props.asc == "notepadPage" || props.asc == "songPage")){
      contentDisp = "";
    }

    // switch that determines which edit element to show
    switch(props.asc){
      case "dueDate":
        contentDisp = dateToDatetimeLocal(props.content);
        editElement = <input type="datetime-local" className={`${styles.infoEditBox} ${styles.dateTimeBox}`} onChange={props.handleContentChange} name={props.asc} value={dateToDatetimeLocal(contentDisp)} />;
        break;
      case "dateCreated":
      case "dateCompleted":
        editElement = <div className={styles.infoContent}>{dispLocalDate(contentDisp)}</div>
        break;
      case "projectType":
        editElement = 
        (<select className={`${styles.infoEditBox} ${styles.infoEditSelector}`} name={props.asc} value={contentDisp} onChange={props.handleContentChange}>
          <option value="normal">normal</option>
          <option value="song">song</option>
          <option value="still art">still art</option>
          <option value="video">video</option>
          <option value="songvideo">songvideo</option>
        </select>);
        break;
      case "projectStatus":
        editElement = <div className={styles.infoContent}>{contentDisp}</div>
        break;
      default:
        editElement = <textarea rows="1" name={props.asc} onChange={props.handleContentChange} className={styles.infoEditBox} value={contentDisp}/>;
    }
  }

  else {  
    if (props.content == null){
      return null;
    }
    // switch statement for if we need to display the info in a special way.
    switch(props.asc){
      case "dateCreated":
      case "dueDate":
      case "dateCompleted":
        contentDisp = dispLocalDate(props.content);
        break;
      case "songPage":
        contentDisp = <Link className={styles.outlink} href={"/songs?refid=" + String(contentDisp)}>here</Link>
        break;
      case "notepadPage":
        contentDisp = <Link className={styles.outlink} href={"/notepad?refid=" + String(contentDisp)}>here</Link>
        break;
    }
  }

  return(
    <div className={styles.infoItem}>
      <div className={styles.infoTitle}>{props.title}</div>
      {!props.editMode && <div className={styles.infoContent}>{contentDisp}</div>}
      {props.editMode && editElement}
    </div>
  )
}

function DescriptionDisplay(props) {
  const descriptionEditorRef = useRef(null);

  useEffect(() => {
    if (props.editMode && descriptionEditorRef.current) {
      /* textareaRef.current.focus(); */
      descriptionEditorRef.current.style.height = 'auto';
      descriptionEditorRef.current.style.height = `${descriptionEditorRef.current.scrollHeight}px`;
    }
  }, [props.editMode]);

  const handleSizing = (event) => {
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
  <div>
    <CenterHeader text="description"/>
    {!props.editMode && <div className={`${styles.descBox} ${styles.textBoxSpacing}`}>{props.info.description}</div>}
    {props.editMode && 
      <textarea 
        ref = {descriptionEditorRef}
        className={`${styles.descEditBox}`} 
        name="description" 
        onChange={(event) => {
          props.handleContentChange(event);
          handleSizing(event);
        }}
        rows={Math.ceil(props.info.description.length / 50)}
        value={props.info.description}
      />}
  </div>
  )
}

function Panel(props) {
  let panelClass;

  if (props.topPanel === true){
    panelClass = `${styles.panel} ${styles.topPanel}`
  }

  else {
    panelClass = styles.panel;
  }

  return(
    <div className={panelClass}>
      {props.children}
    </div>
  )
}

function CenterHeader(props) {
  return (
    <div className={`${styles.sectionHeader} ${styles.textBoxSpacing}`}>{props.text}</div>
  )
}

function Button(props){

  return (
    <div onClick={props.onClick} className={styles.button}>
      {props.text}
    </div>
  )
}

function ButtonBox(props){

  return (
    <div className={styles.buttonBox}>
      {
        Object.keys(props.buttons).map((prop) => (
          <Button key={prop} asc={prop} onClick={props.buttons[prop].func} text={props.buttons[prop].text} />
        ))
      }
    </div>
  );
}

// API call functions
const backendUpdateInfo = async (info) => {
  // call api to update the project item
  try {
    const response = await fetch('/api/projects/post/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });

    if (response.ok){
      //respMessage = "changes saved.";
      console.log("success");
    }

    else {
      //respMessage = "erm. title and description fail!";
      console.log("fail.");
    }
  }

  catch (error) {
    //respMessage = "erm. title and description fail!";
    console.log("fail hard.");
  }
};

// Formatting helper functions
const deCamelCase = (key) => {
  // split the key by camel case and join with spaces
  return key.split(/(?=[A-Z])/).join(' ');
};

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

// function to check if number valid. WILL RETURN TRUE IF VALUE IS NULL.
function isValidNumber(num) {
  if (num == null){
    return true;
  }

  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
    return false;
  } else {
    return true;
  }
}

export async function getServerSideProps(context) {

  let apiUrl, response;
  let post = null, notes = null, modules= null;

  apiUrl = 'http://localhost:3000/api/projects/post/1';
  response = await fetch(apiUrl);
  post = await response.json();

  return {
    props: {
      post,
      bodyClass: "body-projects"
    }
  };
}
