import os
import re
import time
import sys
import zipfile
import soundfile as sf
import speech_recognition as sr

r = sr.Recognizer()
path = './' + sys.argv[1]
#print(path)
files = os.listdir(path)


for f in files:
    print(f)

    if re.match(r'(.*?).wav', f):
        #print("success")
        sound_path = path + '/' + f
        

        sound = sf.SoundFile(sound_path)
        
        with sr.AudioFile(sound_path) as source:
            for i in range (int((len(sound) / sound.samplerate) / 90) + 1):
                audio = r.record(source, duration = 90)
                try:
                    print(r.recognize_google(audio, language = 'zh-tw'))
                
                except:
                    #print("maybe next time")
                    continue
    print()



