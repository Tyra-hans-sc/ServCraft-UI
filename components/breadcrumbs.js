import NewBreadCrumbs from '../PageComponents/Layout/Breadcrumbs';

function Breadcrumbs(props) {
  return <NewBreadCrumbs {...props} />
}

  /*const [breadcrumbs, setBreadcrumbs] = useState([]);

  const extraClass = (props.color == 'white' ? " crumb-white" : "");

  const getBreadCrumb = () => {
    let crumbString = sessionStorage[Enums.Cookie.servCrumbs]; //Storage.getCookie(Enums.Cookie.servCrumbs);
    if (crumbString) {
      return JSON.parse(crumbString);
    } else {
      return null;
    }
  };

  const updateBreadcrumb = (crumbs) => {
    setBreadcrumbs(crumbs);
    //Storage.setCookie(Enums.Cookie.servCrumbs, JSON.stringify(crumbs));
    sessionStorage[Enums.Cookie.servCrumbs] = JSON.stringify(crumbs);
  };

  useEffect(() => {
    initialiseCurrentPage();
  }, []);

  const isFirst = useRef(true);

  useEffect(() => {
    if (props.currPage && props.currPage.type === "list") {
      initialiseCurrentPage();
    }
  }, [props.currPage]);

  const initialiseCurrentPage = () => {
    const localCrumbs = getBreadCrumb();
    if (localCrumbs) {
      if (props.currPage) {
        const last = localCrumbs.length - 1;

        if (props.currPage.type == 'list') {
          let newCrumbs = [{ text: 'Dashboard', link: '/' }];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        if (props.currPage.type == localCrumbs[last].type) {
          let newCrumbs = [{ text: 'Dashboard', link: '/' }];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        if (props.currPage.type == 'edit' && localCrumbs[last].type == 'create') {
          let newCrumbs = [...localCrumbs];
          newCrumbs.splice(last, 1);
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
          return;
        }

        let currPageIndex = -1;
        for (let x = 0; x < localCrumbs.length; x++) {
          if (localCrumbs[x].text == props.currPage.text && localCrumbs[x].link == props.currPage.link) {
            currPageIndex = x;
          }
        }

        if (currPageIndex == -1) {
          let newCrumbs = [...localCrumbs];
          newCrumbs.push(props.currPage);
          updateBreadcrumb(newCrumbs);
        } else if (currPageIndex == localCrumbs.length - 1) {
          updateBreadcrumb(localCrumbs);
        } else {
          let newCrumbs = localCrumbs.slice(0, currPageIndex + 1);
          updateBreadcrumb(newCrumbs);
        }
      } else {
        let newCrumbs = [{ text: 'Dashboard', link: '/' }];
        updateBreadcrumb(newCrumbs);
      }

    } else {
      let newCrumbs = [{ text: 'Dashboard', link: '/' }];
      if (props.currPage) {
        newCrumbs.push(props.currPage);
      }
      updateBreadcrumb(newCrumbs);
    }
  };

  return (
    <div className="breadcrumbs">
      {props.crumbs
        ? props.crumbs.map((item, key) =>
          <div className={`${item.suppressLink ? 'suppressed-crumb' : ''} crumb` + extraClass} key={key}>
            {item.suppressLink ? `${item.text}` :
              <Link
                  style={{
                    textDecoration: 'none'
                  }}
                  // legacyBehavior={true}
                  href={Helper.getLinkRedirect(item.link)}
                  prefetch={false}
              >
                <span onClick={() => Helper.nextLinkClicked(item.link)}>{item.text}</span>
              </Link>
            }
            {props.color == 'white'
              ? <img src="/icons/arrow-breadcrumb-white.svg" alt="arrow" />
              : <img src="/icons/arrow-breadcrumb.svg" alt="arrow" />
            }
          </div>
        )
        : breadcrumbs.map((item, key) =>
          <div className={"crumb" + extraClass} key={key}>
            <Link
                style={{
                  textDecoration: 'none'
                }}
                // legacyBehavior={true}
                href={Helper.getLinkRedirect(item.link)}
                prefetch={false}
            >
              <span onClick={() => Helper.nextLinkClicked(item.link)}>{item.text}</span>
            </Link>
            {props.color == 'white'
              ? <img src="/icons/arrow-breadcrumb-white.svg" alt="arrow" />
              : <img src="/icons/arrow-breadcrumb.svg" alt="arrow" />
            }
          </div>
        )
      }
      <style jsx>{`
        .breadcrumbs {
          align-items: center;
          display: flex;
          margin-left: -0.75rem;
        }
        .breadcrumbs :global(.crumb) :global(a) {
          color: ${colors.labelGrey};
          cursor: pointer;
          margin-left: 0.75rem;
          font-size: 14px;
          text-decoration: none;
        }
        .breadcrumbs :global(.crumb:last-child) :global(a) {
          color: ${colors.darkPrimary};
          font-size: 1rem;
          font-weight: bold;
          opacity: 0.8;
        }
        .breadcrumbs :global(.crumb) :global(img) {
          margin-left: 0.5rem;
        }
        .breadcrumbs :global(.crumb:last-child) :global(img) {
          display: none;
        }
        .breadcrumbs :global(.crumb-white) :global(a){
          color: ${colors.white};
        }
        .breadcrumbs :global(.crumb-white:last-child) :global(a) {
          color: ${colors.white};
          opacity: 0.8;
        }
        .suppressed-crumb {
          color: ${colors.labelGrey};
          margin-left: 0.75rem;
          font-size: 14px;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}

Breadcrumbs.defaultProps = {
  text: 'Button',
};*/

export default Breadcrumbs
