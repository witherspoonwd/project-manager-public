// next js imports
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// react js imports
import {useState, useEffect, useRef} from 'react';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/microblog.module.css';

// set filesize transfer limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// main Microblog component
export default function Microblog({post, posts, numPosts, actionPass}) {

  // get qtref and newBool for passing down to child components
  const router = useRouter();
  const { new: newBool } = router.query || false;
  const { qtref } = router.query || null;

  let root; // root to store what we should display to user.

  const [rootComponent, setRootComponent] = useState();

  if (post){
    root = <SinglePostBody post={post} numPosts={numPosts}/>
  } 

  else if (newBool){
      root = <PosterBody qtref={qtref}/>
  }

  else {
    root = <PostIndexBody posts={posts} numPosts={numPosts} actionPass={actionPass}/>
  }

  return root;
}

// function component for displaying a table row with date and title of microblog post
function PostIndex(props) {
  return (
    <tr key={props.date}>
      <td>{ props.date }</td>
      <td><Link className={styles.tableItem} href={"/microblog?postID=" + props.postID}>{ props.title }</Link></td>
    </tr>
    );
}

// function component for displaying the post index page
function PostIndexBody(props) {

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

  // check for if somehow an error was passed through
  if (actionPass[3] == "true"){
    message = "error detected. no post created.";
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
    message = "complete error. no post created.";
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
        <title>microblog</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      {message && (
        <MessageBox message={message} />
      )}

      <div className={`${mainStyles.title} ${styles.title}`}>microblog</div>

      <div className={mainStyles.contentTable}>
        <table>
          <tbody>
          {props.posts.map((item, index) => (
            <PostIndex key={index} date={item.date} title={item.title} postID={item.postID}/>
           ))}
          </tbody>
        </table>
      </div>
      
      <PageNumbers numPosts={props.numPosts.num}/>

      <Link href="/"className={`${mainStyles.bigButton} ${styles.backButton}`}>exit</Link> <br/>
      <Link href="/microblog?new=1"className={`${mainStyles.bigButton} ${styles.newPostButton}`}>make new post</Link>
      <br />
      <br />
      <br />
      <HiddenButton />

    </div>
  )
}

// hidden button for switching between viewall and paged
function HiddenButton() {
    // get viewall from url
    const router = useRouter();
    const { viewall } = router.query;

    if (viewall == "1"){
      return <div className={mainStyles.hiddenButton}><Link href="/microblog">back to page numbers</Link></div>;
    }

    else {
      return <div className={mainStyles.hiddenButton}><Link href="/microblog?viewall=1">back to paged view</Link></div>;
    }
}

// make page numbers
function PageNumbers(props) {
  var linkPrepend = "/microblog?page=";

  // get page number from url
  const router = useRouter();
  let { page } = router.query;
  const { viewall } = router.query;

  // if no page passed, make it 1
  page = page ?? 1;

  // if we're in viewall mode, don't display page nums
  if (viewall == "1"){
    return null;
  }

  // define some variables that are useful
  const spacer = "\u00A0\u00A0";
  const numPosts = props.numPosts;

  // if less than 25, return null.
  if (numPosts <= 25 || numPosts == false){
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

function DeleteModal(props) {

  // state for redirect variable
  const [redirect, setRedirect] = useState(null);

  let postID = String(props.postID);

  // function that actually makes the call to delete and calls the redirect
  const handleDelete = async () => {
    const apiUrl = 'http://localhost:3000/api/microblog/post/delete/' + postID;
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

// component that is used to display a post (hence SinglePost)
function SinglePostBody(props) {
  // states for deleteModal and pageTitle
  const [deleteElement, setDeleteElement] = useState(null);
  const [pageTitle, setPageTitle] = useState(props.post.postTitle);

  // get qt ref from url
  const qtRef = props.post.quoteTweetRef || false;
  //console.log(qtRef);

  // function to close delete modal
  const handleNeverMind = async () => {
    setPageTitle(props.post.postTitle);
    setDeleteElement(null);
  };
  
  // function to handle open delete modal
  const handleDeleteClick = async () => {
    setPageTitle("DELETING " + props.post.postTitle);
    setDeleteElement(<DeleteModal onClick={handleNeverMind} postID={props.post.postID} />);
  };

  return(
    <div>
    {deleteElement}

    <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
    </Head>

    <SinglePostText post={props.post}/>
    {qtRef && <QuoteTweet quoteTweetRef={qtRef}/>}
    <SinglePostControlPanel post={props.post} numPosts={props.numPosts} onClick={handleDeleteClick}/>

    </div>
  )
}

// function that displays microblog post content
// NEED TO IMPLEMENT SAFE HTML DISPLAY AT LATER POINT.
function SinglePostText(props) {
  // get html in string
  let postHTML = props.post.postContent;

  // display html, adding pre tag if needex
  if (postHTML.charAt(0) != "<"){
    return <pre className={styles.pre} dangerouslySetInnerHTML={{ __html: postHTML }} />
  }

  else {
    return <div dangerouslySetInnerHTML={{ __html: postHTML }} />
  }

}

// component for control buttons for single post
function SinglePostControlPanel(props) {

  const postID = props.post.postID;

  return (
    <div>
      <p className={`${styles.edit} ${mainStyles.nobottom}`}><Link href={"/microblog?new=1&qtref=" + String(postID)}>quote tweet</Link></p>
      <p className={`${styles.scary} ${mainStyles.notop}`}>
        <Link href="#" onClick={props.onClick}>delete post</Link>
      </p>
      <p className={styles.back}>
        <Link href="/microblog" legacyBehavior>back to microblog</Link>
      </p>
    </div>
  )
}

// function component that pulls a relevant quote tweet and displays it
function QuoteTweet(props){
  // define relevant states and variables
  const qtID = props.quoteTweetRef;
  const [qt, setQt] = useState(null); // state for quote tweet data object
  const [postHTML, setPostHTML] = useState(null); // state for storing and analysing qt post content

  // pull the actual quote tweet in this Effect
  useEffect(() => {
    async function getQT() {
      let apiUrl = 'http://localhost:3000/api/microblog/post/' + String(qtID);
      let response = await fetch(apiUrl);
      const get = await response.json();
      setPostHTML(get.postContent);
      setQt(get);
    }
    getQT();
  }, []);

  // variable for determinng if the post needs tags.
  let needsTags = false;


  // if nothing, display this ig
  if (!qt){
    return <div className={styles.quotetweet}>loading quote tweet...</div>
  }

  else{
    // check for need of tags
    if (qt.postContent.charAt(0) != "<"){
      needsTags = true;
    }

    return(
      <div className={styles.quotetweet}>
        <Link href={"/microblog?postID=" + qtID}>
          <p className={styles.qttitle}>
            {qt.postTitle}
          </p>
          <p className={styles.postdate}>
            {qt.postDateTime}
          </p>
          <div className={styles.quotetweetbody}>
            {needsTags && <pre className={styles.pre} dangerouslySetInnerHTML={{ __html: postHTML }}/>}
            {!needsTags && postHTML}
          </div>
        </Link>
      </div>
    );
  }

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
      pathname: '/microblog',
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
      pathname: '/microblog',
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

    <PosterForm qtref={props.qtref} editID={props.editID}/>

    <p className={styles.back}>
      <Link href="/microblog">erm, nevermind</Link>
    </p>

    </div>
  )
}

function PosterForm(props) {

  // used element states
  const [redirect, setRedirect] = useState(null);
  const [message, setMessage] = useState(false);

  // states for form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
      setTimeout(setContent(content + "<img src=\"/microblog/" + selectedFile.name + "\">\n"), 50);

      
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

    // if the thing is blank, show an error modal and don't do anything else.
    if (title == "" || content == ""){
      setMessage(null);
      setMessage(<MessageBox message="error: no content input."/>);

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

    // add qtref and edit id (which probably won't be used. no edits.)
    //formData.append('editID', editID);
    formData.append('quoteTweetRef', quoteTweetRef);

    try {
      // Send a POST request to the server with the form data
      const response = await fetch('/api/microblog/post/new', {
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
          content: <br/>
        </label>
        <textarea className={styles.textarea} rows="31" cols="75" value={content} onChange={handleContentChange} />
        <br />
        <br />
        
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

// get static stuff
export async function getServerSideProps(context) {

  // get query from context
  const {query} = context;

  // get params for what page to display
  const postID = isNaN(parseInt(query.postID)) ? false : parseInt(query.postID);
  const viewall = query.viewall || false;
  let pageNum = query.page || 1;
  const qtref = query.qtref || null;
  

  // Check if the "forceRefresh" query parameter is present
  const forceRefresh = query.forceRefresh === 'true';

  // gen actionPass, which is relevant for what message to display from the PostIndexBody
  let actionPass = [];
  actionPass.push(query.fileSuccess);
  actionPass.push(query.postSuccess);
  actionPass.push(query.deleteSuccess);
  actionPass.push(query.errorSuccess);
  actionPass.push(query.forcedRefresh);

  // variables for data objects that might be passed to the main part
  let post = false;
  let posts;
  let numPosts;

  // check if we should viewall, if so make relevant api call
  if (viewall == "1"){
    const apiUrl = 'http://localhost:3000/api/microblog/posts';
    const response = await fetch(apiUrl);
    posts = await response.json();
  }

  // check for if we are displaying a single post, if so make a call to get just that post's info
  else if (postID){
    let apiUrl = 'http://localhost:3000/api/microblog/post/' + String(postID);
    let response = await fetch(apiUrl);
    post = await response.json();

    posts = null;
  }

  // if all else fails, just show the page index.
  else {
    // and if a specific page isn't called, just show page one
    if (!pageNum) {
      pageNum = 1;
    }

    let apiUrl = 'http://localhost:3000/api/microblog/posts';
    let response = await fetch(apiUrl, {
      headers: {
        page: pageNum.toString()
      }
    });
    posts = await response.json();
  }

  // get total number of posts and pass it
  const apiUrl = 'http://localhost:3000/api/microblog/num';
  const response = await fetch(apiUrl);
  numPosts = await response.json();

  numPosts = numPosts[0];

  // stringify my actionPass array
  actionPass = JSON.stringify(actionPass);

  return {
    props: {
      post,
      posts,
      numPosts,
      actionPass,
      qtref,
      bodyClass: "body-microblog" // pass class for the main website body
    },
  };
}