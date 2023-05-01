// next js imports
import Head from 'next/head';
import Link from 'next/link';

// stylesheet imports
import mainStyles from '../styles/main.module.css';
import styles from '../styles/links.module.css';

// static import of links (NEED TO REDO AFTER DEV DATABASE AND API IS SET UP.)
const rawLinks = [
  ["http://kaomoji.ru/en/#contents", "japanese emoji site"],
  ["https://www.sessions.edu/color-calculator/", "color wheel calculator"],
  ["https://cssgradient.io/", "CSS gradient generator"],
  ["https://opengameart.org/", "game texture website"],
  ["https://3djungle.net/", "seamless texture website"],
  ["https://matkl.github.io/average-color/", "get average color of image"],
  ["https://phpdelusions.net/pdo", "the best pdo tutorial on the internet"],
  ["https://web.dev/responsive-web-design-basics/", "responsive web design tutorial"],
  ["http://www.heropatterns.com/", "the holy grail of css pattern generators"],
  ["https://audio.online-convert.com/convert-to-wav", "convert to wav for le triton extreme"],
  ["https://en.wikibooks.org/wiki/Blender_3D:_Noob_to_Pro/", "really good blender tutorial"],
  ["https://huygens-fokker.org/docs/intervals.html", "list of intervals"],
  ["https://www.favicon-generator.org/", "favicon generator"],
  ["http://liamrosen.com/fitness.html", "weight loss bible (see referenced links in the article for more info)"],
  ["https://tips.clip-studio.com/en-us/articles/2901", "making seamless textures in clip studio paint"],
  //["https://web.archive.org/web/20190807042804/http://heroic.academy/how-to-finalize-your-mix", "mixing bible"]
];

export default function Links({LinkList}) {

  return (
    <div>
      <Head>
        <title>links</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className={`${mainStyles.title} ${styles.title}`}>useful links</div>

      <div className={styles.contentTable}>
        <table>
          <tbody>
          {LinkList.map((item, index) => (
            <LocalLink key={index} link={item.link} description={item.description} />
          ))}
          </tbody>
        </table>
      </div>

      <Link href="/"className={`${mainStyles.bigButton} ${styles.backButton}`}>exit</Link> <br/>
      <Link href="not-implemented"className={`${mainStyles.bigButton} ${styles.newButton}`}>add link</Link>

    </div>
  );
}

function LocalLink (props) {
  return (
    <tr key={props.link}>
      <td className={styles.linkstd}>
        <a className={styles.tableItem} href={props.link}> { props.description } </a>
      </td>
    </tr>
  )
}

export async function getStaticProps () {

  // generate link list from raw links
  const LinkList = rawLinks.map((item) => ({
    link: item[0],
    description: item[1],
  }));

  return {
    props: {
      LinkList,
      bodyClass: "body-links"
    },
  };
}
