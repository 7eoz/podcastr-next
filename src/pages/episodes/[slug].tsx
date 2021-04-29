import {  GetStaticPaths, GetStaticProps } from 'next'
import { format, parseISO } from 'date-fns'
import enUS from 'date-fns/locale/en-US';
import Image from 'next/image'
import { api } from '../../services/api'
import { ConvertDurationToTimeString } from '../../Utils/ConvertDurationToTimeString';

import styles from './episode.module.scss'

type Episode = {
	id: string;
	title: string;
	thumbnail: string;
    description: string;
	members: string;
	publishedAt: string;
	duration: number;
	durationAsString: string;
	url: string;
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps ) {    
    return (
        <div className={styles.episode}>
            <div className={styles.thumbnail}>
                <button type='button'>
                    <img src="/arrow-left.svg" alt="Back"/>
                </button>
                <Image 
                width={700} 
                height={160} 
                src={episode.thumbnail} 
                objectFit="cover"
                />
                <button type="button">
                    <img src="/play.svg" alt="Play Episode"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{ __html: episode.description }} 
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async(ctx) => {
    const { slug } = ctx.params

    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy',{ locale:enUS } ),
        duration: Number(data.file.duration),
        durationAsString: ConvertDurationToTimeString(Number(data.file.duration)),
        description:data.description,
        url: data.file.url
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24 //24 hours
    }
}