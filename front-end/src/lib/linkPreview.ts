import kyInstance from "@/lib/ky";
import { IWebsiteInfos } from 'node-webscrap';

const translations: Record<string, (o: any, v: any) => void> = {
    'og:image': (o: any, v: any) => o.openGraph.image = v,
    'og:image:alt': (o: any, v: any) => o.openGraph.imageAlt = v,
    'og:image:width': (o: any, v: any) => o.openGraph.imageWidth = Number(v),
    'og:image:height': (o: any, v: any) => o.openGraph.imageHeight = Number(v),
    'og:site_name': (o: any, v: any) => o.openGraph.name = v,
    'og:type': (o: any, v: any) => o.openGraph.type = v,
    'og:title': (o: any, v: any) => o.openGraph.title = v,
    'og:url': (o: any, v: any) => o.openGraph.url = v,
    'og:description': (o: any, v: any) => o.openGraph.description = v,
    'twitter:card': (o: any, v: any) => o.socials.twitter.card = v,
    'twitter:title': (o: any, v: any) => o.socials.twitter.title = v,
    'twitter:description': (o: any, v: any) => o.socials.twitter.description = v,
    'twitter:site': (o: any, v: any) => o.socials.twitter.site = v,
    'twitter:image': (o: any, v: any) => o.socials.twitter.image = v,
    'twitter:creator': (o: any, v: any) => o.socials.twitter.creator = v,
    'author': (o: any, v: any) => o.metadata.author = v,
    'description': (o: any, v: any) => o.metadata.description = v,
    'themeColor': (o: any, v: any) => o.metadata.themeColor = v,
    'robots': (o: any, v: any) => o.metadata.robots = v,
    'title': (o: any, v: any) => o.metadata.title = v,
};

const request = async (url: string): Promise<{ statusCode: number, statusMessage: string, data: string }> => {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy
    const response = await fetch(proxyUrl + url, { // Use the proxy
        headers: {
            "Content-Type": "application/json",
        },
    });
    return {
        statusCode: response.status,
        statusMessage: response.statusText,
        data: await response.text(),
    };
};

export async function webscrap(url: string) {
    const infos: IWebsiteInfos = {
        metadata: {},
        openGraph: {},
        socials: {
            twitter: {}
        }
    };
    const response = await request(url);
    if (response.statusCode >= 400) {
        throw new Error(`Failed to fetch resource at ${url} (status ${response.statusCode} : ${response.statusMessage})`);
    }
    const data = response.data;
    const headTagIndexStart = data.indexOf('<head');
    const headTagIndexEnd = data.indexOf('</head>');
    const headContent = data.slice(headTagIndexStart, headTagIndexEnd);
    const metaTags = [...headContent.matchAll(/<meta\s+property=["'](og|twitter):(.+?)["']\s*content=["'](.*?)["']\s*\/?>/g)]
        .map(match => ([match[1] + ':' + match[2], match[3]]))
        .reduce((prev, curr) => {
            prev[curr[0] as any] = curr[1];
            return prev;
        }, {} as Record<string, string>);
    metaTags.author = headContent.match(/<meta\s+name=["']author["']\s*content=["'](.*?)["']\s*\/?>/)?.[1] || '';
    metaTags.description = headContent.match(/<meta\s+name=["']description["']\s*content=["'](.*?)["']\s*\/?>/)?.[1] || '';
    metaTags.themeColor = headContent.match(/<meta\s+name=["']theme-color["']\s*content=["'](.*?)["']\s*\/?>/)?.[1] || '';
    metaTags.robots = headContent.match(/<meta\s+name=["']robots["']\s*content=["'](.*?)["']\s*\/?>/)?.[1] || '';
    metaTags.title = headContent.match(/<title>\s*(.*?)\s*<\/title>/)?.[1] || '';
    const favicons = headContent
        .match(/<link(.*?)href=["'](.*?(png|svg|ico|jpg|jpeg|gif))["'](.*?)\/?>/g)
        ?.map((m: any) => m.match(/href=["'](.*?)["']/)?.[1] || '');
    if (favicons) {
        infos.metadata.favicons = favicons;
    }
    for (const key in translations) {
        if (metaTags[key]) {
            translations[key](infos, metaTags[key]);
        }
    }
    return infos;
}
