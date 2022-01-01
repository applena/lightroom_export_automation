# lightroom_export_automation
## Goal: 
The goal of this project is to export photos from lightroom based on star and color ratings into folders on the desktop that meet the following criteria:

* Photos with 1 star -> get exported as a raw file to a folder named the month that the photo was taken
* Photos with 1 star -> get exported as a .jpg file to a folder named the month that they photo was taken
* Photos with 5 stars -> get exported as a .jpg resized with the long edge to be 1600 pixels into a folder named 'insta' in the root of the month folder
* Photos with 5 stars and a red rating -> get exported to a folder named 'print' as a .jpg file full sized in the root of the year the photo was taken

## Notes on Investigation of SQLite
Lightroom stores it's files in a SQLite database in a .lcrt catalog. Here is a step-by-step process of our investigation into SQLite.
### Step 1: Launch SQLite
```
sqlite3 <path to filename>
```

### Step 2: Examine all the tables
```
.tables
```
### Step 3: Star Rating Are Stored in Adobe_Images
```
SELECT rating from Adobe_images;
```
### Step 4: Select ratings and root files in Adobe_Images
```
select rating, rootFile from Adobe_images;
```
### Step 5: The AgLibraryFile has the id of the image
```
select * from AgLibraryFile where id_local=217785;

select * from AgLibraryFile where id_local=(select rootFile from Adobe_images limit 1);
```