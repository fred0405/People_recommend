from __future__ import unicode_literals
import youtube_dl


ydl_opts = {
    'format': '-f/bestaudio/best',
    'playlist-start':'1',
    #'playlist-end':'2',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'wav',
        'preferredquality': '192',
    }],
}
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/channel/UCOPRIQpsikpMDmI_VOwnbmw/videos'])
