// next js imports
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// react js imports
import {useState, useRef} from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/songs.module.css';

export default function Songs({posts, select, numPosts, post, edit, newBool, convertMelody, actionPass}) {
  let root; 
  
  if (posts){
    root = <SongsIndexBody select={select} posts={posts} numPosts={numPosts.num} actionPass={actionPass}/>;
  }  // editing
  else if (edit && post){
    root = <PosterBody select={select} post={post} />
  }
  else if ((convertMelody != false) && post){
    root = <PosterBody select={select} post={post} convert={convertMelody} />
  }
  else if (post) {
    root = <SinglePostBody select={select} post={post}/>
  }
  // new post
  else if (newBool){
    root = <PosterBody select={select} />
  }

  return root;
}

// function component for displaying a table row with date and title of microblog post
function PostIndex(props) {
  // get select variable
  let select = props.select;

  let postHREF;

/*   if (select == "melodies"){
    postHREF = "/melodies/" + props.htmlPath;
  } */

  postHREF = "/songs?select=" + select + "&refid=" + props.refID;

  return (
    <tr className={styles.tableRow}key={props.date}>
      <td>{ props.date }</td>
      <td><Link className={styles.tableItem} href={postHREF}>{ props.title }</Link></td>
    </tr>
  );
}

// function component for displaying the appropriate index based on the "select" param
function SongsIndexBody(props) {

  // conv;
  let selectSingular;

  // vars to pass class to title buttons
  let songsButtonClass = styles.titleButton;
  let melodiesButtonClass = styles.titleButton;
  let sessionsButtonClass = styles.titleButton;

  // vars to pass links or text to title buttons
  let songsButtonText = <Link href="/songs">songs</Link>;
  let melodiesButtonText = <Link href="/songs?select=melodies">melodies</Link>;
  let sessionsButtonText = <Link href="/songs?select=sessions">sessions</Link>;

  // set appropriate title buttons based on props.select
  if (props.select){
    switch (props.select){
      case 'melodies':
        melodiesButtonText = "melodies";
        melodiesButtonClass = styles.switchPressed;
        selectSingular = "melody";
        break;
      case 'sessions':
        sessionsButtonText = "sessions";
        sessionsButtonClass = styles.switchPressed;
        selectSingular = "session";
        break;
      default:
        songsButtonText = "songs";
        songsButtonClass = styles.switchPressed;
        selectSingular = "song";
        break;
    }
  }

  // import router
  const router = useRouter();

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

  // check for if somehow an error managed to get something through
  if (actionPass[3] == "true"){
    message = "no input detected. try again.";
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
    message = "total error detected.";
  }

  // check for delete success
  else if (actionPass[2] == "true"){
    message = "the post has been deleted";
  }

  else {
    message = null;
  }

  if (message && !fixedURL){
    window.history.replaceState({}, '', '/microblog');
    fixedURL = true;
  }

  return(
    <div>
      <Head>
        <title>songs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      {message && (
        <MessageBox message={message} />
      )}

      <div className={mainStyles.title}>
        <span className={songsButtonClass}>
          {songsButtonText}
        </span>
        &nbsp;/&nbsp;
        <span className={melodiesButtonClass}>
          {melodiesButtonText}
        </span>
        &nbsp;/&nbsp;
        <span className={sessionsButtonClass}>
          {sessionsButtonText}
        </span>
      </div>

      <div className={mainStyles.contentTable}>
        <table>
          <tbody>
            {  props.posts.map((item, index) => (
              <PostIndex key={index} date={item.date} title={item.title} refID={item.refID} htmlPath={item.htmlPath} select={props.select}/>
            ))}
          </tbody>
        </table>
      </div>

      <PageNumbers numPosts={props.numPosts} select={props.select}/>

      <Link href="/"className={`${mainStyles.bigButton} ${styles.backButton}`}>exit</Link> <br/>
      <Link href={"/songs?select=" + props.select + "&new=1"} className={`${mainStyles.bigButton} ${styles.newPostButton}`}>new {selectSingular}</Link>
      <br />
      <br />
      <br />
      <HiddenButton select={props.select}/>

    </div>
  )
}

// hidden button for switching to "viewall" mode
function HiddenButton(props) {
  // get viewall from url
  const router = useRouter();
  const { viewall } = router.query;

  let linkPrepend;

  if (props.select){
    switch (props.select){
      case 'melodies':
        linkPrepend = "/songs?select=melodies"
        break;
      case 'sessions':
        linkPrepend = "/songs?select=sessions"
        break;
      default:
        linkPrepend = "/songs?select=songs"
        break;
    }
  }

  if (viewall == "1"){
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend}>back to page numbers</Link></div>;
  }

  else {
    return <div className={mainStyles.hiddenButton}><Link href={linkPrepend + "&viewall=1"}>back to paged view</Link></div>;
  }
}

// make page numbers
function PageNumbers(props) {

  var select = props.select;
  var linkPrepend;

  if (select){
    switch (select){
      case 'melodies':
        linkPrepend = "/songs?select=melodies&page="
        break;
      case 'sessions':
        linkPrepend = "/songs?select=sessions&page="
        break;
      default:
        linkPrepend = "/songs?select=songs&page="
        break;
    }
  }

  // get page number from url
  const router = useRouter();
  let { page } = router.query;
  const { viewall } = router.query;

  // if no page number passed, make it 1
  page = page ?? 1;

  // if we're in viewall mode, do not display
  if (viewall == "1"){
    return null;
  }

  // define some variables that are useful
  const spacer = "\u00A0\u00A0";
  const numPosts = props.numPosts;
  
  // if less than 25, return null
  if (numPosts < 25){
    return null;
  }

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

// component that is used to display a post (hence SinglePost)
function SinglePostBody(props) {
  // states for deleteModal and pageTitle
  const [deleteElement, setDeleteElement] = useState(null);
  const [pageTitle, setPageTitle] = useState(props.post.title);

  // function to close delete modal
  const handleNeverMind = async () => {
    setPageTitle(props.post.title);
    setDeleteElement(null);
  };
  
  // function to handle open delete modal
  const handleDeleteClick = async () => {
    setPageTitle("DELETING " + props.post.title);
    setDeleteElement(<DeleteModal select={props.select} onClick={handleNeverMind} postID={props.post.refid} />);
  };

  return(
    <div>
    {deleteElement}

    <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
    </Head>

    <SinglePostText select={props.select} className={styles.postText} post={props.post}/>
    <SinglePostControlPanel select={props.select} post={props.post} onClick={handleDeleteClick}/>

    </div>
  )
}

// function that displays microblog post content
function SinglePostText(props) {

  // get html in string
  let postHTML = props.post.content;

  // if it's a melody, display an audio element
  if (props.select == "melodies"){
    return (
      <audio autoPlay controls>
        <source src={"/melodies/" + postHTML} />
      </audio>
    )
  }

  // display html, adding pre tag if needex
  if (postHTML.charAt(0) != "<"){
    return <pre className={styles.pre} dangerouslySetInnerHTML={{ __html: postHTML }} />
  }

  else {
    return <div className={styles.postText} dangerouslySetInnerHTML={{ __html: postHTML }} />
  }

}

// component for control buttons for single post
function SinglePostControlPanel(props) {
  const refid = props.post.refid;

  let redirectHref = "/songs?select=" + props.select + "&edit=1&refid=" + String(refid);

  let editText = "edit post";
  let deleteText = "delete post";

  if (props.select == "melodies"){
    editText = "convert to song";
    deleteText = "delete melody";
    redirectHref = "/songs?select=melodies&convertMelody=" + String(refid);
  }

  return (
    <div>
      <p className={`${styles.edit} ${mainStyles.nobottom}`}>
        <Link href={redirectHref}>
          {editText}
        </Link>
      </p>
      <p className={`${styles.scary} ${mainStyles.notop}`}>
        <Link href="#" onClick={props.onClick}>
          {deleteText}
        </Link>
      </p>
      <p className={styles.back}>
        <Link href={"/songs?select=" + props.select}>back to {props.select} page</Link>
      </p>
    </div>
  )
}

// modal for handling post delete (INC)
function DeleteModal(props) {

  let apiUrl;

  if (props.select){
    switch (props.select){
      case 'melodies':
        apiUrl = "/api/melodies/post/delete/";
        break;
      case 'sessions':
        apiUrl = "/api/sessions/post/delete/";
        break;
      default:
        apiUrl = "/api/songs/post/delete/";
        break;
    }
  }

  // state for redirect variable
  const [redirect, setRedirect] = useState(null);

  let postID = String(props.postID);

  // function that actually makes the call to delete and calls the redirect
  const handleDelete = async () => {
    apiUrl = apiUrl + postID;
    const response = await fetch(apiUrl);
    const get = await response.json();

    //console.log(get.deleteSuccess);
    setRedirect(<RedirectComponent select={props.select} deleteSuccess={get.deleteSuccess}/>);
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

// component used to redirect passing information for both posting, deleting, and converting
function RedirectComponent(props) {
  const router = useRouter();

  const select = props.select;

  // check for relevant props
  const fileSuccess = props.fileSuccess || false;
  const postSuccess = props.postSuccess || false;
  const deleteSuccess = props.deleteSuccess || "none";
  const editID = props.editID || false;

  if (editID != false){
    router.push({
      pathname: '/songs',
      query: {
        select,
        refid: editID, 
      },
    });
  }

  // if were posting, pass relevant props to root page
  else if (deleteSuccess === "none"){
    router.push({
      pathname: '/songs',
      query: {
        select,
        fileSuccess, 
        postSuccess, 
        forcedRefresh: true 
      },
    });
  }

  // same if were deleting
  else {
    router.push({
      pathname: '/songs',
      query: {
        select,
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

    <PosterForm select={props.select} post={props.post}/>

    <p className={styles.back}>
      <Link href={"/songs?select=" + props.select}>erm, nevermind</Link>
    </p>

    </div>
  )
}

function PosterForm(props) {

  let staticTitle = "";
  let staticContent = "";
  let nonMelody = true;
  let wereEditing = false;

  // check if we're editing
  if (props.post){
    staticTitle = props.post.title;
    staticContent = props.post.content;
    if (!(props.post.convert)){
      wereEditing = true;
    }
  }

  if (props.select == "melodies"){
    nonMelody = false;
  }

  // used element states
  const [redirect, setRedirect] = useState(null);
  const [message, setMessage] = useState(false);

  // states for form inputs
  const [title, setTitle] = useState(staticTitle);
  const [content, setContent] = useState(staticContent);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected.");

  // ref for handling a click on the file upload button
  const fileInputRef = useRef(null);

  // get relevant params from url
  const quoteTweetRef = props.qtref || null;
  //const editID = props.editID || null;

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

      // if a file is selected, append an <img> tag automatically to the content
      setTimeout(setContent(content + "<a href=\"/" + props.select + "/" + selectedFile.name + "\">" + selectedFile.name + "</a>"), 50);

      
    } else {
      setSelectedFile(null);
      setSelectedFileName("");
    }
  };

  // function that opens the hidden file input form entry
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  // function that actually submits the form and also redirects to the index
  const handleSubmit = async (event) => {
    event.preventDefault(); // don't want the default redirects

    let apiUrl;

    if (props.select){
      switch (props.select){
        case 'melodies':
          apiUrl = "/api/melodies/post/submit";
          break;
        case 'sessions':
          apiUrl = "/api/sessions/post/submit";
          break;
        default:
          apiUrl = "/api/songs/post/submit";
          break;
      }
    }

    // if the thing is blank, show an error modal and don't do anything else.
    if ((title == "" || content == "") && nonMelody){
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
    formData.append('filename', selectedFileName);

    if (nonMelody == true){
      // Add the values of the textareas to the form data
      formData.append('title', title);
      formData.append('content', content);
    }

    // add qtref and edit id (which probably won't be used. no edits.)
    if (wereEditing){
      formData.append('editID', props.post.refid);
    }

    try {
      // Send a POST request to the server with the form data
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {

        // check if our post and file succeeded in updating
        const { fileSuccess, postSuccess, editSuccess } = await response.json();

        if (wereEditing){
          setRedirect(<RedirectComponent select={props.select} editID={props.post.refid}/>);
        }

        else {
          // if so, redirect to homepage and show success/error message
          setRedirect(<RedirectComponent select={props.select} fileSuccess={fileSuccess} postSuccess={postSuccess}/>);
        }

      } else {
        console.error('File upload failed.');
      }

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // return the actual html
  return(
    <div className={styles.formBody}>
      {message}

      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        {nonMelody && <div>
        <label>
          title: <br/>
        </label>
        <textarea className={styles.textarea} rows="1" cols="75" style={{resize: 'none'}} value={title} onChange={handleTitleChange} />
        <br />
        <br />
        
        <label>
          content: <br/>
        </label>
        <textarea className={styles.textarea} rows="31" cols="75" value={content} onChange={handleContentChange} />
        <br />
        <br />
        </div>}
        
        
        <input className={styles.input} type="button" value="upload file" onClick={handleClick} />
        <label>&nbsp;{selectedFileName}      </label> 
        <input type="file" accept="image/*,audio/wav,audio/mp3" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

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

export async function getServerSideProps (context) {
  // get query from context
  const {query} = context;

  // get params for what page to display
  //const postID = isNaN(parseInt(query.postID)) ? false : parseInt(query.postID);
  let select = query.select || "songs";
  let refid = query.refid || false;
  let viewall = query.viewall || false;
  let page = query.page || 1;
  let edit = query.edit || false;
  let newBool = query.new || false;
  let convertMelody = query.convertMelody || false;

  let response; // container for api results

  let post = null, posts = null, numPosts = []; // var for storing api responses
  let indexUrl, numUrl, postUrl; // vars for storing api urls for appropriate select var

  // gen actionPass, which is relevant for what message to display from the PostIndexBody
  let actionPass = [];
  actionPass.push(query.fileSuccess);
  actionPass.push(query.postSuccess);
  actionPass.push(query.deleteSuccess);
  actionPass.push(query.errorSuccess);
  actionPass.push(query.forcedRefresh);

  switch (select){
    case "melodies":
      indexUrl = 'http://localhost:3000/api/melodies/posts';
      numUrl = 'http://localhost:3000/api/melodies/num';
      postUrl = 'http://localhost:3000/api/melodies/post/'; //probably not needed
      break;
    case "sessions":
      indexUrl = 'http://localhost:3000/api/sessions/posts';
      numUrl = 'http://localhost:3000/api/sessions/num';
      postUrl = 'http://localhost:3000/api/sessions/post/';
      break;
    default:
      indexUrl = 'http://localhost:3000/api/songs/posts';
      numUrl = 'http://localhost:3000/api/songs/num';
      postUrl = 'http://localhost:3000/api/songs/post/';
      break;
  }

  if (viewall == '1'){
    response = await fetch(indexUrl);
    posts = await response.json();
    numPosts.num = 0;
  }

  else if (select && !refid && !newBool && !convertMelody){
    let response = await fetch(indexUrl, {
      headers: {
        page: page.toString()
      }
    });
    posts = await response.json();

    response = await fetch(numUrl);
    numPosts = await response.json();
    numPosts = numPosts[0];
  }

  else if (select && convertMelody){
    postUrl = postUrl + String(convertMelody);
    let response = await fetch(postUrl);
    post = await response.json();

    post.content = "<a href=\"/melodies/" + post.content.replace(/\r?\n|\r/g, "") + "\">" + post.content.replace(/\r?\n|\r/g, "") + "</a>";

    post.convert = true;

    select = "songs";
  }

  else if (refid/*  && (select != 'melodies') */) { // assuming a single post is to be displayed
    postUrl = postUrl + String(refid);
    let response = await fetch(postUrl);
    post = await response.json();
  }

  // stringify my actionPass array
  actionPass = JSON.stringify(actionPass);

  return {
    props: {
      select,
      posts,
      numPosts,
      post,
      bodyClass: "body-songs",
      edit,
      convertMelody,
      newBool,
      actionPass
    }
  };
}
