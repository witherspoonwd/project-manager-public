// next js imports
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

// react js imports
import {useState, useRef} from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/sketchbook.module.css';

export default function Home({posts, numPosts, post, newBool, actionPass}) {

  let root;

  if (post){
    root = <SketchBody post={post} />;
  }

  else if (newBool){
    root = <PosterBody/>
  }

  else {
    root = <SketchIndexBody actionPass={actionPass} posts={posts} numPosts={numPosts}/>
  }

  return root;
}


function SketchIndexBody (props) {

  // get viewall from url
  const router = useRouter();
  const { viewall } = router.query || false;

  // function that forces a refresh of serverSideProps. remove the forcedRefresh param and redirect without it
  const refreshData = () => {
    // Get the query object from the current URL
    const query = new URLSearchParams(router.asPath.split('?')[1])

    // Remove the "forcedRefresh" query parameter
    query.delete('forcedRefresh')

    // Reconstruct the URL with the modified query string
    const newPath = `${router.pathname}${query.toString() ? `?${query.toString()}` : ''}`

    // make a fresh call of the index
    router.replace(newPath)
  }

  // get actionPass array which tells which message to display in the notification modal
  const actionPass = JSON.parse(props.actionPass);

  // check if we should refresh index
  if (actionPass[4] == "true"){
    refreshData();
  }

  let message; // message for my notification modal
  let fixedURL = false; // bool for if the url has been cleaned

  // check for if somehow a error managed to get something through
  if (actionPass[3] == "true"){
    message = "error.";
  }

  // check for full post success
  else if (actionPass[0] == "true" && actionPass[1] == "true"){
    message = "the post has been created.";
  }

  // check for post success but file fail
  else if (actionPass[0] == "false" && actionPass[1] == "true"){
    message = "the post has been created. file upload failed.";
  }

  // check for total error
  else if (actionPass[0] == "false" && actionPass[1] == "false"){
    message = "sowwy 3:";
  }

  // check for delete success
  else if (actionPass[2] == "true"){
    message = "the post has been deleted";
  }

  else {
    message = null;
  }

  if (message && !fixedURL){
    window.history.replaceState({}, '', '/sketchbook');
    fixedURL = true;
  }

  return (
  <div>
    <Head>
      <title>sketchbook</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex" />
    </Head>

    {message && (
      <MessageBox message={message} />
    )}

    <div className={`${mainStyles.title} ${styles.title}`}>
      sketchbook
    </div>

    <div className={mainStyles.contentTable}>
      <table>
        <tbody>
          {props.posts.map((item, index) => (
            <PostIndex key={index} date={item.date} title={item.title} refID={item.refID} select={props.select}/>
          ))}
        </tbody>
      </table>
    </div>

    {!viewall && <PageNumbers numPosts={props.numPosts}/> }

    <Link href="/"className={`${mainStyles.bigButton} ${styles.backButton}`}>exit</Link> <br/>
    <Link href={"/sketchbook?new=1"} className={`${mainStyles.bigButton} ${styles.newPostButton}`}>new sketch</Link>
    <br />
    <br />
    <br />
    <HiddenButton/>

  </div>
  )
}

// function component for displaying a table row with date and title of microblog post
function PostIndex(props) {
  return (
    <tr className={styles.tableRow} key={props.date}>
      <td>{ props.date }</td>
      <td><Link className={styles.tableItem} href={"/sketchbook?refid=" + props.refID}>{ props.title }</Link></td>
    </tr>
  );
}

// hidden button for switching to "viewall" mode
function HiddenButton(props) {
  // get viewall from url
  const router = useRouter();
  const { viewall } = router.query;

  let linkPrepend = "/sketchbook";

  if (viewall == "1"){
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend}>back to page numbers</Link></div>;
  }

  else {
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend + "?viewall=1"}>back to paged view</Link></div>;
  }
}

// make page numbers
function PageNumbers(props) {
  var linkPrepend = "/sketchbook?page=";

  // get page number from url
  const router = useRouter();
  let { page } = router.query;
  const { viewall } = router.query;

  // if its no page passed, set to 1
  page = page ?? 1;

  // if we're in viewall mode, no need for page nums
  if (viewall == "1"){
    return null;
  }

  // define some variables that are useful
  const spacer = "\u00A0\u00A0";
  const numPosts = props.numPosts.num;

  // if less than 25, return null
  if (numPosts <= 25){
    return null;
  }

  console.log(numPosts);

  //determine how many pages can exist.
  const numPages = Math.ceil(numPosts / 25);

  // define nav button elements
  let firstButton;
  let lastButton;
  let nextButton;
  let prevButton;

  // generate first and last and next and prev buttons
  if (page == 1){
    const lastPageHref = linkPrepend + String(numPages);
    const nextPageHref = linkPrepend + String(Number(page) + 1);

    firstButton = "<<";
    prevButton = "<";
    nextButton = <Link href={nextPageHref}>&gt;</Link>;
    lastButton = <Link href={lastPageHref}>&gt;&gt;</Link>;
  }

  else if (page == numPages){
    const firstPageHref = linkPrepend + "1";
    const prevPageHref = linkPrepend + String(Number(page) - 1);


    firstButton = <Link href={firstPageHref}>&lt;&lt;</Link>;
    prevButton = <Link href={prevPageHref}>&lt;</Link>;
    nextButton = ">";
    lastButton = ">>";
  }

  else {
    const firstPageHref = linkPrepend + "1";
    const lastPageHref = linkPrepend + String(numPages);
    const nextPageHref = linkPrepend + String(Number(page) + 1);
    const prevPageHref = linkPrepend + String(Number(page) - 1);

    firstButton = <Link href={firstPageHref}>&lt;&lt;</Link>;
    lastButton = <Link href={lastPageHref}>&gt;&gt;</Link>;
    nextButton = <Link href={nextPageHref}>&gt;</Link>;
    prevButton = <Link href={prevPageHref}>&lt;</Link>;
  }

  // generate elipsises elements
  let leftElipsis = "...";
  let rightElipsis = spacer + "..." + spacer;

  if (page < 4){
    leftElipsis = null;
  }

  else if (page > (numPages - 3)){
    rightElipsis = null;
  }

  if (numPages < 5){
    leftElipsis = null;
    rightElipsis = null;
  }

  // generate actual number elements
  let numberElements = [];

  
  if (page > (numPages - 3) && numPages > 5){
    for (let i = numPages - 5; i < numPages; i++){
      numberElements.push(spacer);

      let pageHolder = i + 1;

      if (pageHolder == page){
        numberElements.push(pageHolder);
        continue;
      }

      const pageHref = linkPrepend + String(pageHolder);
      numberElements.push(<Link key={pageHref} href={pageHref}>{pageHolder}</Link>);
    }

    numberElements.push(spacer);
  }

  else if (numPages > 5) {
    for (let i = -2; i < 3; i++){

      numberElements.push(spacer);
      let pageHolder;

      if (page < 4){
        pageHolder = i + 3;

        if (pageHolder < 1 || pageHolder > numPages){
          continue;
        }

        if (pageHolder == page){
          numberElements.push(pageHolder);
          continue;
        }

        const pageHref = linkPrepend + String(pageHolder);
        numberElements.push(<Link key={pageHref} href={pageHref}>{pageHolder}</Link>);
      }

      else {

        pageHolder = Number(page) + i;


        if (pageHolder == page){
          numberElements.push(pageHolder);
          continue;
        }

        const pageHref = linkPrepend + String(pageHolder);
        numberElements.push(<Link key={pageHref} href={pageHref}>{pageHolder}</Link>);
      }
    }
  }

  else {
    for (let i = 1; i < numPages + 1; i++){
      let pageHolder = i;

      if (pageHolder > numPages){
        continue;
      }

      numberElements.push(spacer);

      if (pageHolder == page){
        numberElements.push(pageHolder);
        continue;
      }

      const pageHref = linkPrepend + String(pageHolder);
      numberElements.push(<Link key={pageHref} href={pageHref}>{pageHolder}</Link>);
    }
    numberElements.push(spacer);
    numberElements.push(spacer);
  }

  return(
    <div className={styles.pageNumbers}>
      <p>
        {firstButton}{spacer}{prevButton}{spacer}{leftElipsis}{numberElements}{rightElipsis}{nextButton}{spacer}{lastButton}
      </p>
    </div>
  )
}

function SketchBody(props) {
  // states for deleteModal and pageTitle
  const [deleteElement, setDeleteElement] = useState(null);
  const [pageTitle, setPageTitle] = useState(props.post.title);

  // function to close delete modal
  const handleNeverMind = async () => {
    setPageTitle(props.post.postTitle);
    setDeleteElement(null);
  };
  
  // function to handle open delete modal
  const handleDeleteClick = async () => {
    setPageTitle("DELETING " + props.post.title);
    setDeleteElement(<DeleteModal onClick={handleNeverMind} refid={props.post.refid} />);
  };

  return(
    <div>
      {deleteElement}

      <Head>
          <title>{pageTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.titleBox}>
        <p>
          <span className={styles.sketchTitle} >{props.post.title}</span> - {props.post.date}
        </p>
      </div>

      <div className={styles.sketchBox}>
        <img className={styles.sketch} src={"/sketchbook/" + props.post.img}/>
      </div>

      <div className={styles.commentComplex}>
        <div className={styles.comSpace}>&nbsp;</div>
        <div className={styles.commentsBox}>
          <p className={styles.sketchComments}>
            {props.post.content}
          </p>

          <p className={styles.scary}>
            <Link href="#" onClick={handleDeleteClick}>delete sketch</Link>
          </p>
          <p className={styles.back}>
            <Link href="/sketchbook">back to sketchbook</Link>
          </p>
        </div>
        <div className={styles.comSpace}>&nbsp;</div>
      </div>

    </div>
  )
}

function DeleteModal(props) {

  // state for redirect variable
  const [redirect, setRedirect] = useState(null);

  let postID = String(props.refid);

  // function that actually makes the call to delete and calls the redirect
  const handleDelete = async () => {
    const apiUrl = 'http://localhost:3000/api/sketchbook/post/delete/' + postID;
    const response = await fetch(apiUrl);
    const get = await response.json();

    //console.log(get.deleteSuccess);
    setRedirect(<RedirectComponent deleteSuccess={get.deleteSuccess}/>);
  };

  return (
    <div className={styles.fullScreenModal}>
      {redirect}
      <div className={styles.deleteBox}>
        <p>
          confirm deletion?
        </p>
        <p className={styles.scary}>
          <a onClick={handleDelete}>YES. DELETE IT. NOW.</a><br/>
        </p>
        <p className={styles.back}>
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

  // if were posting, pass relevant props to root page
  if (deleteSuccess === "none"){
    router.push({
      pathname: '/sketchbook',
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
      pathname: '/sketchbook',
      query: {
        deleteSuccess,
        forcedRefresh: true,
      },
    });
  }
  
  // Return null if theres no props
  return null;
}

// function component for when were using the microblog poster
function PosterBody(props){

  return(
    <div>

    <Head>
      <title>we do a little posting...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex" />
    </Head>

    <PosterForm/>

    <p className={styles.back}>
      <Link href="/sketchbook">erm, nevermind</Link>
    </p>

    </div>
  )
}

function getCurrentDate(){
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const currentDate = `${year}-${month}-${day}`;
  return currentDate;
}

function PosterForm(props) {

  let staticTitle = "";
  let staticContent = "";

  // used element states
  const [redirect, setRedirect] = useState(null);
  const [message, setMessage] = useState(false);

  // states for form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [completionDate, setCompletionDate] = useState(getCurrentDate());
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected.");


  // ref for handling a click on the file upload button
  const fileInputRef = useRef(null);

  // these handle data that is input into the form by updating their state
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
  
    if (selectedFile) {
      setSelectedFile(selectedFile);
      setSelectedFileName(selectedFile.name);
      
    } else {
      setSelectedFile(null);
      setSelectedFileName("No file selected.");
    }
  };

  const handleDateChange = (event) => {
    setCompletionDate(event.target.value);
  }

  // function that opens the hidden file input form entry
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  // function that actually submits the form and also redirects to the index
  const handleSubmit = async (event) => {
    event.preventDefault(); // don't want the default redirects

    // if the thing is blank, show an error modal and don't do anything else.
    if (title == "" || (selectedFileName == "No file selected.") ){
      setMessage(null);
      setMessage(<MessageBox message="no input detected. try again."/>);

      // this timeout lets it be displayed multiple times
      setTimeout(function() {
        setMessage(null);
      }, 4000); // Wait 2 seconds before executing the function

      return;
    }

    // Create a FormData object
    const formData = new FormData();

    // Add the selected file to the form data
    formData.append('file', selectedFile);

    // Add the values of the textareas to the form data
    formData.append('title', title);
    formData.append('content', content);
    formData.append('filename', selectedFileName);
    formData.append('date', completionDate);

    try {
      // Send a POST request to the server with the form data
      const response = await fetch('/api/sketchbook/post/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {

        // check if our post and file succeeded in updating
        const { fileSuccess, postSuccess } = await response.json();
        //console.log(fileSuccess, postSuccess);

        // if so, redirect to homepage and show success/error message
        setRedirect(<RedirectComponent fileSuccess={fileSuccess} postSuccess={postSuccess} />);

      } else {
        console.error('File upload failed.');
      }

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // return the actual html
  return(
    <div>
      {message}

      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <label>
          title: <br/>
        </label>
        <textarea className={styles.textarea} rows="1" cols="75" style={{resize: 'none'}} value={title} onChange={handleTitleChange} />
        <br />
        <br />
        <label>
          comments: <br/>
        </label>
        <textarea className={styles.textarea} rows="3" cols="75" value={content} onChange={handleContentChange} />
        <br />
        <br />
        
        <input className={styles.input} type="button" value="upload file" onClick={handleClick} />
        <label>&nbsp;{selectedFileName}      </label> 
        <input type="file" accept="image/*,audio/wav,audio/mp3" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

        <br />
        <br />
        <label>completion date:</label><br/>
        <input className={styles.input} value={completionDate} type="date" onChange={handleDateChange} />

        <br />
        <br />
        <input className={styles.input} type="submit" value="post!" />

        {redirect}

      </form>
    </div>
  );
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

export async function getServerSideProps(context) {

  // get query from context
  const {query} = context;

  let bodyClass = "body-sketchbook";

  let apiUrl, response;
  let post = null, posts = null, numPosts = null;

  let refid = query.refid || false;
  const viewall = query.viewall || false;
  let pageNum = query.page || 1;
  let newBool = query.new || false;

  // gen actionPass, which is relevant for what message to display from the PostIndexBody
  let actionPass = [];
  actionPass.push(query.fileSuccess);
  actionPass.push(query.postSuccess);
  actionPass.push(query.deleteSuccess);
  actionPass.push(query.errorSuccess);
  actionPass.push(query.forcedRefresh);

  if (refid) { // assuming a single post is to be displayed
    let postUrl = "http://localhost:3000/api/sketchbook/post/" + String(refid);
    let response = await fetch(postUrl);
    post = await response.json();
    bodyClass = "body-sketch";
  }

  else if (viewall == 1){
    // get posts index object
    apiUrl = 'http://localhost:3000/api/sketchbook/posts';
    response = await fetch(apiUrl);
    posts = await response.json();
  }

  // if all else fails, just show the page index.
  else {
    // and if a specific page isn't called, just show page one
    if (!pageNum) {
      pageNum = 1;
    }

    apiUrl = 'http://localhost:3000/api/sketchbook/posts';
    response = await fetch(apiUrl, {
      headers: {
        page: pageNum.toString()
      }
    });
    posts = await response.json();

    // get total number of posts and pass it
    apiUrl = 'http://localhost:3000/api/sketchbook/num';
    response = await fetch(apiUrl);
    numPosts = await response.json();
  
    numPosts = numPosts[0];
  }

  // stringify my actionPass array
  actionPass = JSON.stringify(actionPass);

  return {
    props: {
      post,
      posts,
      numPosts,
      newBool,
      actionPass,
      bodyClass: bodyClass
    }
  };
}
