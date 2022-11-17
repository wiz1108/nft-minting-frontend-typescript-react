import Twitter from '../../../assets/imgs/twitter_icon.png'
import Discord from '../../../assets/imgs/discord_icon.png'
import Medium from '../../../assets/imgs/medium_icon.png'

import styles from './index.module.scss'

const Footer = () => {
  return (
    <>
      <div className={styles.border} />
      <div className={styles.body}>
        <div className={styles.down}>
          <a
            className={styles.link}
            href="https://twitter.com"
            target="blank">
            <div><img src={Twitter} alt='twitter' className={styles.social} /></div>
          </a>

          <a
            className={styles.link}
            href="https://discord.com"
            target="blank">
            <div><img src={Discord} alt='discord' className={styles.social} /></div>
          </a>

          <a
            className={styles.link}
            href="https://medium.com"
            target="blank">
            <div><img src={Medium} alt='medium' className={styles.social} /></div>
          </a>
        </div>
        <div className={styles.info}>
          <p className={styles.text}>© 2022 Liquid NFT</p>
        </div>
      </div >
    </>
  )
}

export default Footer