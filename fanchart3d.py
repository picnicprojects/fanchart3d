from gedcomParser import GedcomParser
import datetime
import codecs, os, shutil, string, sys, getopt

def init():
   try:
      os.makedirs('generated/')
   except:
      pass
   fid = codecs.open('generated/data.js', encoding='utf-8',mode='w')
   fid.write('var data = [\n')
   return(fid)

def fix_names(p):
   if len(p.nick_name) > 0:
      first = p.nick_name
   else:
      first = p.first_name.split(' ')[0]
   last = p.surname.replace("zur ", "").replace("de ", "").replace("dem ", "").replace("von ", "").replace("van ", "").replace("-", " ").split(' ')[0]
   p.display_name = first + " " + last

def guess_dates(all_persons, ID):
   p = all_persons[ID]
   p.guess_alive = False
   if p.birth_guess == False:
      if len(p.family) > 0:
         for family in p.family:
            if len(family.spouse_id) > 0:
               if all_persons[family.spouse_id].birth_guess != False:
                  p.birth_guess = all_persons[family.spouse_id].birth_guess
               else:
                  if len(family.child_id) > 0:
                     for child_id in family.child_id:
                        if all_persons[child_id].birth_guess != False:
                           p.birth_guess = all_persons[child_id].birth_guess - datetime.timedelta(days=25*365)
   if p.death_guess == False:
      if p.birth_guess != False:
         if (datetime.date.today() - p.birth_guess) < datetime.timedelta(days=120*365): # still alive
            p.death_guess = datetime.date.today()
            p.guess_alive = True
         else:
            p.death_guess = p.birth_guess + datetime.timedelta(days=65*365)
            if p.death_guess > datetime.date.today():
               p.death_guess = datetime.date.today()
   if (p.birth_guess != False) and (p.death_guess != False):
      p.age = (p.death_guess-p.birth_guess).days/365
   else:
      p.age = False
   if len(p.parent_id) > 0:
      for pid in p.parent_id:
         guess_dates(all_persons, pid)

def write_ancestors(fid, all_persons, id, generation, segment):
   # print("%d-%d: %s" % (generation, segment, id))
   if generation < 60:
      p = all_persons[id]
      fid.write('{"generation":"%d", "segment":"%d", "gender":"%s", "name": "%s", "birth_date": "%s", "death_date": "%s", "birth_guess":"%s", "death_guess":"%s","guess_alive":"%s"},\n' % (generation, segment, p.gender, p.display_name, p.birth_date, p.death_date, p.birth_guess, p.death_guess, p.guess_alive)) 
      print('%d|%d %s - %s: {%s} %s (%s, %s, %s, %s) %d' % (generation, segment, p.gender, id, p.display_name, p.surname, p.birth_date, p.death_date, p.birth_guess, p.death_guess, p.age))
      generation = generation + 1
      if len(p.parent_id) > 0:
         for pid in p.parent_id:
            parent = all_persons[pid]
            if parent.gender == 'M':
               seg = 2*segment
            else:
               seg = 2*segment+1
            # fid.write('{"generation":"%d", "segment":"%d", "name": "%s", "gender":"%s", "birth_date": "%s", "death_date": "%s"},\n' % (generation, seg, parent.first_name, parent.gender, parent.birth_date, parent.death_date)) 
            write_ancestors(fid, all_persons, pid, generation, seg)
   return segment + 2

gedfile = "gedcom-files/dutchroyalfamily.ged"; ID = 'I1208'
# gedfile = "gedcom-files/myfamily.ged"; ID = 'I0000'

g = GedcomParser(gedfile)
all_persons = g.get_persons()
fid = init()
for i,p in all_persons.items():
   print(i,p.first_name + " " + p.surname)
   fix_names(p)
   p.birth_guess = p.birth_date
   p.death_guess = p.death_date
guess_dates(all_persons, ID)
write_ancestors(fid, all_persons, ID, 1, 0)
fid.write('];\n')

