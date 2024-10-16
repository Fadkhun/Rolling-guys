let absenTerisi = [];
let mejaKosong = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'C5'];
let daftarNama = [
    'Adeline Revinda Early', 'Ahmad Ramadani Arrosyid', 'Alivea Nurinda Amira Umar', 'Ar Rifqi Mohamad Stiawan', 
    'Aulia Dwi Ariyanti', 'Aulia Rahma Hanum', 'Ayla Sonia Kaysa Mahira', 'Callista Nasiwa Putri', 'Chelsa Oktavia', 
    'Danys Aqela Tsabita Hermanto', 'Fadhly Ramadhan Arieyanto', 'Fatiha Agest Fatahillah', 'Fikry Naufal Shafiyullah', 
    'Hilda Emilatus Sholihah', 'M Eky Jauhar Akbar', 'Marshanda Dwiyatma Varista Anum', 'Moch Tantra Leo Fatrianto', 
    'Moh Rafi Ghani Zulkarnaen', 'Mohammad Krisna Yustisio', 'Muhammad Dastin Ilmidafiq Rahmad', 'Muhammad Dwi Febriyanto', 
    'Nadine Aufa Ramadhani', 'Naura Asya Khairina', 'Naura Zahiyyah Salwa Syafirah', 'Nayla Dwining Putri', 'Priyo Handoko', 
    'Rizky Ega Pratama', 'Shofi Anggraini Rahmaningtyas', 'Siti Sahwal Pusparani', 'Syafilla Fitri Faradilla', 
    'Widyananda Dwi Putri Islami', 'Yahya Gunawan', 'Yasintha Dwi Ayu', 'Yuvita Putri Nabila'
];
let wheelRotation = 0;
let undoStack = [];

// Draw wheel with random order
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
function drawWheel() {
    const numSegments = mejaKosong.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    const shuffledMeja = [...mejaKosong].sort(() => Math.random() - 0.5);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(150, 150);
    for (let index = 0; index < numSegments; index++) {
        const startAngle = index * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 150, startAngle, endAngle);
        ctx.fillStyle = index % 2 === 0 ? '#D3D3D3' : '#FFFFFF';
        ctx.fill();

        ctx.save();
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(shuffledMeja[index], 60, 10);
        ctx.restore();
    }
    ctx.restore();
}
drawWheel();

// Toggle class list
document.getElementById('toggleClassList').addEventListener('click', function() {
    const classList = document.getElementById('namaKelas');
    classList.classList.toggle('hidden');
});

// Render daftar nama
const namaKelasUl = document.getElementById('namaKelas');
daftarNama.forEach((nama, index) => {
    const li = document.createElement('li');
    li.id = `absen-${index + 1}`;
    li.innerText = `${index + 1}. ${nama}`;
    namaKelasUl.appendChild(li);
});

// Acak tempat duduk dengan spin
function spinWheel(callback) {
    const totalRotation = 360 * (Math.random() * 5 + 3);
    canvas.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        wheelRotation += totalRotation * (Math.PI / 180);
        const selectedIndex = Math.floor((wheelRotation / (2 * Math.PI)) * mejaKosong.length) % mejaKosong.length;
        callback(mejaKosong[selectedIndex]);
    }, 3000);
}

function acakTempatDuduk() {
    const absenInput = document.getElementById('absen').value;
    const absens = absenInput.split(',').map(num => num.trim());

    if (absens.length > 2 || absens.some(absen => isNaN(absen) || absen < 1 || absen > 34 || absenTerisi.includes(absen))) {
        alert('Masukkan nomor absen yang valid (1-34) dan tidak ada duplikasi.');
        return;
    }

    spinWheel(function(mejaTerpilih) {
        const mejaElement = document.getElementById(mejaTerpilih);
        const jumlahIsiMeja = mejaElement.innerText.split(', ').length;

        if (jumlahIsiMeja >= 2) {
            alert('Meja ' + mejaTerpilih + ' sudah penuh.');
            return;
        }
        
        absens.forEach(absen => {
            if (mejaElement.innerText === '-') {
                mejaElement.innerText = absen;
            } else {
                mejaElement.innerText += `, ${absen}`;
            }
            absenTerisi.push(absen);
            undoStack.push({ meja: mejaTerpilih, absen });
            
            // Hilangkan dari daftar nama
            const listItem = document.getElementById(`absen-${absen}`);
            if (listItem) listItem.style.display = 'none';
        });

        // Hapus meja dari mejaKosong jika sudah penuh
        if (mejaElement.innerText.split(', ').length === 2) {
            mejaKosong = mejaKosong.filter(meja => meja !== mejaTerpilih);
        }

        // Reset input
        document.getElementById('absen').value = '';
    });
}

function restart() {
    absenTerisi = [];
    mejaKosong = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'C5'];
    undoStack = [];

    // Reset table
    document.querySelectorAll('td[id^=A], td[id^=B], td[id^=C], td[id^=D]').forEach(td => {
        td.innerText = '-';
    });

    // Reset class list
    daftarNama.forEach((_, index) => {
        const listItem = document.getElementById(`absen-${index + 1}`);
        if (listItem) listItem.style.display = 'block';
    });

    drawWheel();
}

function undo() {
    if (undoStack.length === 0) {
        alert('Tidak ada aksi untuk di-undo.');
        return;
    }

    const { meja, absen } = undoStack.pop();
    const mejaElement = document.getElementById(meja);
    
    // Hapus absen dari meja
    const currentAbsens = mejaElement.innerText.split(', ').filter(a => a !== absen);
    mejaElement.innerText = currentAbsens.length > 0 ? currentAbsens.join(', ') : '-';

    // Kembalikan absen ke daftar
    absenTerisi = absenTerisi.filter(a => a !== absen);
    const listItem = document.getElementById(`absen-${absen}`);
    if (listItem) listItem.style.display = 'block';

    // Kembalikan meja ke daftar meja kosong jika jadi kosong
    if (currentAbsens.length < 2) {
        mejaKosong.push(meja);
    }

    drawWheel();
}
