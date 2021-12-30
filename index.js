const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lr.lrcat');



db.each("SELECT i.rating, i.colorLabels, f.idx_filename, AgLibraryFolder.pathFromRoot from Adobe_images as i, AgLibraryFile as f, AgLibraryFolder WHERE i.rating is not null and f.id_local=i.rootFile and AgLibraryFolder.id_local=f.folder", function (err, row) {
  console.log(row, err);
});

db.close();