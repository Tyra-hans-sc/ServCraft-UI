import Link from 'next/link';
import { colors, layout, fontSizes } from '../theme';
import Helper from '../utils/helper';

function SidebarSkeleton(props) {

  return (
    <div className={"sidebar collapsed"}>
      <div className="logo">
        <Link legacyBehavior={true} href="/">
          <a onClick={() => Helper.nextLinkClicked("/")}><img src="/logo-type-white.svg" alt="ServCraft" /></a>
        </Link>
      </div>

      <style jsx>{`
        .sidebar {
          background-color: ${colors.bluePrimary};
          height: 100vh;
          position: relative;
          transition: width 0.5s ease-in-out;
          width: 200px;
        }
        .logo {
          box-sizing: border-box;
          padding: 1.125rem 1.5rem;
          width: 100%;
          margin-bottom: 1rem;
        }
        .link {
          align-items: center;
          border-radius: 0 ${ layout.bodyRadius } ${ layout.bodyRadius } 0;
          cursor: pointer;
          display: flex;
          height: 3rem;
          padding-left: 1rem;
          margin-right: 0.5rem;
          text-decoration: none;
          transition: padding 0.5s ease-in-out;
        }
        .link:hover {
          background-color: ${ colors.blueHue };
        }
        .link p {
          color: ${ colors.white };
          font-size: ${ fontSizes.label };
          font-weight: bold;
          margin-left: 1rem;
          opacity: 1;
          transition: all 0.5s ease-in-out;
          width: 94px;
        }
        ul {
          padding: 0;
          margin: 0;
        }
        ul li {
          height: 0;
          overflow: hidden;
          transition: height 0.5s ease-in-out, padding 0.5s ease-in-out;
        }
        ul li:first-child {
          height: 3rem;
        }
        .open li {
          height: 3rem;
        }
        .spacer {
          height: 1.5rem;
          width: 1.5rem;
        }
        .chevron {
          margin-left: auto;
          margin-right: 0.5rem;
          opacity: 1;
          transition: all 0.5s ease-in-out;
          user-select: none;
        }
        .open .chevron {
          transform: rotate(180deg);
        }
        .arrow {
          bottom: 1rem;
          cursor: pointer;
          position: absolute;
          right: 1rem;
          transition: transform 0.5s ease-in-out;
        }
        .collapsed {
          width: 4.5rem;
        }
        .collapsed .arrow {
          right: 1.5rem;
          transform: rotate(180deg);
        }
        .collapsed .link {
          padding-left: 1.5rem;
          margin: 0;
        }
        .collapsed .link p, .collapsed .link .chevron {
          opacity: 0;
          width: 0px;
          margin: 0px;
        }
      `}</style>
    </div>
  )
}

export default SidebarSkeleton
