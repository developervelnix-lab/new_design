"use client"

import { useEffect } from "react"
import { useSite } from "../../context/SiteContext"
import RanaHeader from "./ranamatch/RanaHeader"
import RanaSidebarLeft from "./ranamatch/RanaSidebarLeft"
import RanaSidebarRight from "./ranamatch/RanaSidebarRight"
import RanaMainContent from "./ranamatch/RanaMainContent"
import '../../assets/css/ranamatch.css'

function Home() {
  const { accountInfo } = useSite()

  useEffect(() => {
    document.body.style.backgroundColor = '#0D0D0D';
    document.body.style.color = '#FFFFFF';
    document.body.style.fontFamily = "'Nunito', sans-serif";

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontFamily = '';
    }
  }, []);

  return (
    <div className="rana-layout">
      <RanaHeader />
      <div className="page-wrap">
        <RanaSidebarLeft />
        <RanaMainContent />
        <RanaSidebarRight />
      </div>
    </div>
  )
}

export default Home
