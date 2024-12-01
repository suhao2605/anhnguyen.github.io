import * as THREE from 'https://cdn.skypack.dev/three@0.155.0'; // Import Three.js

// Khởi tạo scene, camera và renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('map').appendChild(renderer.domElement);

// Đặt vị trí camera
camera.position.set(0, 0, 5);

// Thêm ánh sáng
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

// Khởi tạo raycaster và mouse vector để xử lý tương tác
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Hàm xử lý sự kiện khi di chuyển chuột
function onMouseMove(event) {
    // Chuẩn hóa tọa độ chuột trong không gian WebGL
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Kiểm tra đối tượng được hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    scene.children.forEach(child => {
        if (child.material) {
            child.material.color.set(0x0077b6); // Reset màu gốc
        }
    });

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        if (hoveredObject.material) {
            hoveredObject.material.color.set(0xff5722); // Đổi màu khi hover
        }
    }
}

// Gắn sự kiện di chuyển chuột
window.addEventListener('mousemove', onMouseMove);

// Xử lý click để hiển thị thông tin tỉnh thành
function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const provinceName = clickedObject.userData.name || "Không xác định";
        alert(`Bạn đã chọn: ${provinceName}`);
    }
}

// Gắn sự kiện click chuột
window.addEventListener('click', onClick);

// Hàm tải GeoJSON và hiển thị bản đồ
fetch('./Vietnam.geojson') // Đảm bảo tệp GeoJSON ở cùng thư mục
    .then(response => response.json())
    .then(data => {
        // Duyệt qua từng tỉnh thành trong GeoJSON
        data.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates[0]; // Lấy tọa độ đa giác
            const shape = new THREE.Shape();

            // Chuyển tọa độ GeoJSON thành Shape
            coordinates.forEach(([x, y], index) => {
                if (index === 0) shape.moveTo(x, y); // Điểm đầu tiên
                else shape.lineTo(x, y);            // Các điểm tiếp theo
            });

            // Tạo hình khối 3D cho tỉnh thành
            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: 0.1, // Độ cao của khối
                bevelEnabled: false,
            });

            const material = new THREE.MeshStandardMaterial({
                color: 0x0077b6, // Màu mặc định
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Gắn thông tin tỉnh thành vào đối tượng
            mesh.userData = { name: feature.properties.name };

            scene.add(mesh); // Thêm khối vào scene
        });

        animate(); // Bắt đầu render
    })
    .catch(error => console.error('Lỗi khi tải GeoJSON:', error));

// Vòng lặp render
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Xử lý khi thay đổi kích thước cửa sổ
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
