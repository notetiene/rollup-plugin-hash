import hasha from 'hasha';
import fs from 'fs';
import path from 'path';

const algorithms = {
	'md5': true,
	'sha1': true,
	'sha256': true,
	'sha512': true
};

const defaultOptions = {
	algorithm: 'sha1',
	replace: false
};

const msg = {
	noTemplate: '[Hash] Destination filename must contain `[hash]` template.',
	noAlgorithm: '[Hash] Algorithm can only be one of: md5, sha1, sha256, sha512'
};

function hasTemplate(dest) {
	return /\[hash\]/.test(dest);
}

function formatFilename(dest, hash) {
	return dest.replace('[hash]', hash);
}

function mkdirpath (dest) {
	const dir = path.dirname(dest);
	try {
		fs.readdirSync(dir);
	} catch ( err ) {
		mkdirpath( dir );
		fs.mkdirSync( dir );
	}
}

function logError(msg) {
	throw new Error(msg);
}

export default function hash(opts = {}) {
	const options = Object.assign({}, defaultOptions, opts);

	return {
		name: 'hash',
		onwrite: function(bundle, data) {

			if(!options.dest || !hasTemplate(options.dest)) {
				logError(msg.noTemplate);
				return false;
			}

			if(!algorithms[options.algorithm]) {
				logError(msg.noAlgorithm);
				return false;
			}

			const hash = hasha(data.code, options);
			const fileName = formatFilename(options.dest, hash);

			if(options.replace) {
				fs.unlinkSync(bundle.dest);
			}

			mkdirpath(fileName);
			fs.writeFileSync(fileName, data.code, 'utf8');
		}
	};
}
