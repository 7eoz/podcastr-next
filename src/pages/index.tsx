import { GetStaticProps } from 'next'
import { api } from './../services/api'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import enUS from 'date-fns/locale/en-US'
import { ConvertDurationToTimeString } from './../Utils/ConvertDurationToTimeString';

import styles from './home.module.scss'

type Episode = {
	id: string;
	title: string;
	thumbnail: string;
	members: string;
	publishedAt: string;
	duration: number;
	durationAsString: string;
	url: string;
}

type HomeProps = {
	latestEpisodes: Episode[]
	allEpisodes: Episode[]
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
	return (
		<div className={styles.homePage}>
			<section className={styles.latestEpisodes}>
				<h2>Latest releases</h2>

				<ul>
					{latestEpisodes.map(episode => {
						return(
							<li key={episode.id}>
								<Image 
								width={192} 
								height={192} 
								src={episode.thumbnail} 
								alt="episode.title"
								objectFit='cover'/>
								<div className={styles.episodeDetails}>
									<Link href={`/episodes/${episode.id}`}>
										<a>{episode.title}</a>
									</Link>
									<p>{episode.members}</p>
									<span>{episode.publishedAt}</span>
									<span>{episode.durationAsString}</span>
								</div>
								<button type='button'>
									<img src="./play-green.svg" alt="Play this episode"/>
								</button>
							</li>

							
						)
					})}
				</ul>
			</section>
			<section className={styles.allEpisodes}>
				<h2>All Episodes</h2>

				<table cellSpacing={0}>
					<thead>
						<th></th>
						<th>Podcast</th>
						<th>Members</th>
						<th>Date</th>
						<th>Duration</th>
						<th></th>
					</thead>
					<tbody>
						{allEpisodes.map(episode => {
							return (
								<tr key={episode.id}>
									<td>
										<Image
											width={120}
											height={120}
											src={episode.thumbnail}
											alt={episode.title}
											objectFit="cover"
										/>
									</td>
									<td>
									<Link href={`/episodes/${episode.id}`}>
										<a>{episode.title}</a>
									</Link>
									</td>
									<td>{episode.members}</td>
									<td>{episode.publishedAt}</td>
									<td>{episode.durationAsString}</td>
									<td>
										<button>
											<img src="/play-green.svg" alt="Play episode"/>
										</button>
									</td>
								</tr>
							)
						})}
						</tbody>
				</table>	
			</section>
		</div>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: 'published_at',
			_order: 'desc'
		}
	})

	const episodes = data.map(episode => {
		return {
			id: episode.id,
			title: episode.title,
			thumbnail: episode.thumbnail,
			members: episode.members,
			publishedAt: format(parseISO(episode.published_at), 'd MMM yy',{ locale:enUS } ),
			duration: Number(episode.file.duration),
			durationAsString: ConvertDurationToTimeString(Number(episode.file.duration)),
			url: episode.file.url
		}
	})
	
	const latestEpisodes = episodes.slice(0, 2)
	const allEpisodes = episodes.slice(2, episodes.length)

	return {
		props: {
			latestEpisodes,
			allEpisodes
		},
		revalidate: 60 + 60 * 8,
	}
}
