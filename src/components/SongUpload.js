import firebase from "../index.js"

const db = firebase.database()
const storage = firebase.storage()


class SongUpload {
	constructor(file, roomId) {
		this.file = file
		this.roomId = roomId
		this.name = file.name
		this.isPending = true
	}

	get metadata() {
		return {
			...this.data,
			key:     this.key,
			name:    this.name,
			pending: this.isPending,
		}
	}

	static async getMetadata(file, settings = {}) {
		const mm = await import('musicmetadata')
		return new Promise((res, rej) => {
			mm(file, settings, ((err, metadata) => {
				err && rej(err)
				res(metadata)
			}))
		})
	}

	static uint8ToString(u8a) {
		const CHUNK_SZ = 0x8000;
		let c = [];
		for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
			c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
		}
		return c.join("");
	}

	async start() {
		// Start file upload
		this.uploadTask = storage.ref('songs/' + this.file.name).put(this.file)

		const data = await SongUpload.getMetadata(this.file, {duration: true})

		const {picture, ...metadata} = data
		this.data = metadata
		this.pictureFile = picture
		this.pictureData = (picture && picture[0]) ? 'data:image/' + picture[0].format + ';base64,' +
			btoa(SongUpload.uint8ToString(picture[0].data)) : null

		const dataRef = db.ref('song_data/' + this.roomId).push()
		this.key = dataRef.getKey()
		dataRef.set(this.metadata)
		dataRef.onDisconnect().remove()

		// Tell the database you're uploading something
		const sUploadedRef = db.ref('room_data/' + this.roomId + '/songs/uploaded/' + this.key)
		const sPendingRef = db.ref('room_data/' + this.roomId + '/songs/pending/' + this.key)
		sPendingRef.onDisconnect().remove()
		sPendingRef.set(true)

		// Upload art if there is any
		if (this.pictureData) {
			storage.ref(`art/${this.name}.${this.pictureFile[0].format}`).put(this.pictureFile[0].data)
			.then(ss =>
				// Put the art URL into the song data
				db.ref(`song_data/${this.roomId}/${this.key}/albumURL`).set(ss.downloadURL)
			)
		}

		this.uploadTask.then(ss => {
			// Give the database the URL
			db.ref('song_urls/' + this.key).set(ss.downloadURL)

			// Tell the db it is no longer pending
			sPendingRef.remove()
			sUploadedRef.set(true)
			dataRef.update({pending: false})

			//Turn off disconnection listener
			sPendingRef.onDisconnect().cancel()
			dataRef.onDisconnect().cancel()

			this.isPending = false
			this.file = 'done'
			this.pictureFile = 'done'
		})
	}
}


export default SongUpload