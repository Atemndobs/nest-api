from os import path
from pydub import AudioSegment
import sys
import requests # request img from web
import shutil # save img locally


import argparse

parser = argparse.ArgumentParser(description='Python script for converting mp3 to wav')
parser.add_argument("--song", help="Prints the supplied argument.", default= "Pls add a song")
parser.add_argument("--name", help="Prints the supplied argument.", default= "Pls add a song")

args = parser.parse_args()

print(sys.argv[1])
print(sys.argv[2])
print(sys.argv[3])
print(sys.argv[4])

url = sys.argv[2]
url = url.replace('mage.tech:8899', 'nginx')
file_name = "./src/audio/"  + sys.argv[4]

res = requests.get(url, stream = True)

if res.status_code == 200:
    with open(file_name,'wb') as f:
        shutil.copyfileobj(res.raw, f)
    print('Track sucessfully Downloaded: ',file_name)
else:
    print('Song Couldn\'t be retrieved')

sys.stdout.flush()

name = file_name[:-4]


# files
# src = args.song + ".mp3"
# dst = args.song + ".wav"

# src = "./src/" + sys.argv[2] + ".mp3"
src = file_name
dst = name + ".wav"


print(dst)


# convert wav to mp3
sound = AudioSegment.from_mp3(src)
sound.export(dst, format="wav")