// 导航系统 - 独立模块
import THREE from 'three';

class NavigationSystem {
    constructor(viewer, buildingData) {
        this.viewer = viewer;
        this.buildingData = buildingData;
        this.navigationPath = null;
        this.arrows = [];
        this.customStart = null;

        // 定义路口节点
        this.junctions = [
            { id: 'j0', position: [11.50993104360281, 51.8682473631462, 5.488683224106552], connections: ['j1'] },
            { id: 'j1', position: [-0.3996304216747326, 51.375620400327314, 5.194632267263103], connections: ['j0', 'j2', 'j3'] },
            { id: 'j2', position: [-20.173721266461676, 49.75297757799676, 3.709802073312062], connections: ['j1', 'j4'] },
            { id: 'j3', position: [-0.4754291694464019, 30.419948466730887, 9.235396820287121], connections: ['j1', 'j5'] },
            { id: 'j4', position: [-21.65223106367227, 29.17498884661006, 5.443484706793868], connections: ['j2', 'j5', 'j6'] },
            { id: 'j5', position: [-21.65223106367227, 29.17498884661006, 5.443484706793868], connections: ['j3', 'j4'] },
            { id: 'j6', position: [-18.916439882827444, -13.189507466681654, 6.11138061148273], connections: ['j4'] }
        ];

        // 建筑物到最近路口的映射
        this.buildingJunctions = {
            0: 'j6',
            1: 'j5',
            2: 'j0',
        };

        this.init();
    }

    init() {
        console.log('导航系统初始化完成');
    }

    setCustomStart(position) {
        this.customStart = position;
        console.log('自定义起点设置:', position);
    }

    getCustomStart() {
        return this.customStart;
    }

    // A*路径规划算法
    findPath(startPos, endPos) {
        // 找到最近的起点和终点路口
        const startJunction = this.findNearestJunction(startPos);
        const endJunction = this.findNearestJunction(endPos);

        console.log('路径规划:', startJunction, '->', endJunction);

        // 使用A*算法计算路口之间的路径
        // const junctionPath = this.aStar(startJunction, endJunction);
        //
        // if (!junctionPath) {
        //     console.error('无法找到路径');
        //     return null;
        // }

        // 构建完整路径
        const fullPath = [startPos];

        // // 添加从起点到第一个路口的路径
        // fullPath.push(startJunction.position);
        //
        // // 添加中间路口
        // for (let i = 1; i < junctionPath.length - 1; i++) {
        //     fullPath.push(junctionPath[i].position);
        // }
        //
        // // 添加从最后一个路口到终点的路径
        // fullPath.push(endJunction.position);
        fullPath.push(endPos);

        console.log('路径规划结果:', fullPath);
        return fullPath;
    }

    // 找到最近的路口
    findNearestJunction(position) {
        let nearest = this.junctions[0];
        let minDistance = this.calculateDistance(position, nearest.position);

        for (let i = 1; i < this.junctions.length; i++) {
            const distance = this.calculateDistance(position, this.junctions[i].position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = this.junctions[i];
            }
        }

        return nearest;
    }

    // A*路径规划算法实现
    aStar(startJunction, endJunction) {
        console.log('开始astar');
        const openSet = [startJunction];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(startJunction.id, 0);
        fScore.set(startJunction.id, this.calculateDistance(startJunction.position, endJunction.position));

        while (openSet.length > 0) {
            // 找到fScore最小的节点
            let current = openSet[0];
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                const fCurrent = fScore.get(current.id) || Infinity;
                const fCandidate = fScore.get(openSet[i].id) || Infinity;
                if (fCandidate < fCurrent) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // 如果到达终点
            if (current.id === endJunction.id) {
                return this.reconstructPath(cameFrom, current);
            }

            // 从开放集中移除当前节点
            openSet.splice(currentIndex, 1);

            // 遍历邻居
            for (const neighborId of current.connections) {
                const neighbor = this.junctions.find(j => j.id === neighborId);
                if (!neighbor) continue;

                // 计算临时gScore
                const tentativeGScore = (gScore.get(current.id) || 0) +
                    this.calculateDistance(current.position, neighbor.position);

                if (tentativeGScore < (gScore.get(neighbor.id) || Infinity)) {
                    // 这条路径更好
                    cameFrom.set(neighbor.id, current);
                    gScore.set(neighbor.id, tentativeGScore);
                    fScore.set(neighbor.id, tentativeGScore +
                        this.calculateDistance(neighbor.position, endJunction.position));

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // 没有找到路径
        return null;
    }

    // 重构路径
    reconstructPath(cameFrom, current) {
        const totalPath = [current];
        while (cameFrom.has(current.id)) {
            current = cameFrom.get(current.id);
            totalPath.unshift(current);
        }
        return totalPath;
    }

    // 计算两点之间的距离
    calculateDistance(pos1, pos2) {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // 显示导航路径
    showNavigationPath(startPos, endPos) {
        // 清除现有路径
        this.clearNavigationPath();

        // 计算路径
        const path = this.findPath(startPos, endPos);

        if (!path) {
            alert('无法找到从起点到终点的路径');
            return;
        }

        console.log('导航路径:', path);

        // 创建3D路径
        this.create3DPath(path);

        // 创建动态箭头
        this.createDirectionArrows(path);
    }

    // 创建3D路径
    create3DPath(path) {
        const points = path.map(pos => new THREE.Vector3(...pos));

        // 创建曲线
        const curve = new THREE.CatmullRomCurve3(points);

        // 创建管道几何体
        const geometry = new THREE.TubeGeometry(curve, 64, 0.8, 8, false);

        // 创建发光材质
        const material = new THREE.MeshPhongMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.8,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });

        this.navigationPath = new THREE.Mesh(geometry, material);
        this.viewer.threeScene.add(this.navigationPath);

        // 添加路径动画
        this.animateNavigationPath();
    }

    // 创建方向箭头
    createDirectionArrows(path) {
        this.arrows = [];

        for (let i = 0; i < path.length - 1; i++) {
            const start = new THREE.Vector3(...path[i]);
            const end = new THREE.Vector3(...path[i + 1]);

            // 计算箭头位置（在路径段的中间）
            const arrowPos = new THREE.Vector3().lerpVectors(start, end, 0.5);

            // 计算方向
            const direction = new THREE.Vector3().subVectors(end, start).normalize();

            // 创建箭头
            this.createArrow(arrowPos, direction, i);
        }
    }

    // 创建单个箭头
    createArrow(position, direction, index) {
        // 箭头组
        const arrowGroup = new THREE.Group();

        // 箭头主体（圆锥）
        const coneGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const coneMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6b6b,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);

        // 旋转箭头指向方向
        cone.rotation.x = Math.PI / 2;
        cone.lookAt(direction);

        arrowGroup.add(cone);
        arrowGroup.position.copy(position);

        // 存储箭头信息用于动画
        arrowGroup.userData = {
            originalY: position.y,
            index: index,
            timeOffset: index * 0.2
        };

        this.viewer.threeScene.add(arrowGroup);
        this.arrows.push(arrowGroup);
    }

    // 路径动画
    animateNavigationPath() {
        if (!this.navigationPath) return;

        const animate = () => {
            if (!this.navigationPath) return;

            // 路径脉动效果
            this.navigationPath.material.opacity = 0.6 + 0.2 * Math.sin(Date.now() * 0.003);
            this.navigationPath.material.emissiveIntensity = 0.2 + 0.1 * Math.sin(Date.now() * 0.005);

            // 箭头动画
            this.animateArrows();

            requestAnimationFrame(animate);
        };
        animate();
    }

    // 箭头动画
    animateArrows() {
        const time = Date.now() * 0.001;

        this.arrows.forEach(arrow => {
            const { originalY, timeOffset } = arrow.userData;

            // 上下浮动
            arrow.position.y = originalY + Math.sin(time + timeOffset) * 0.5;

            // 旋转
            arrow.rotation.y = time + timeOffset;

            // 缩放脉动
            const scale = 0.8 + 0.2 * Math.sin(time * 2 + timeOffset);
            arrow.scale.set(scale, scale, scale);
        });
    }

    // 清除导航路径
    clearNavigationPath() {
        // 清除3D路径
        if (this.navigationPath) {
            this.viewer.threeScene.remove(this.navigationPath);
            this.navigationPath = null;
        }

        // 清除箭头
        this.arrows.forEach(arrow => {
            this.viewer.threeScene.remove(arrow);
        });
        this.arrows = [];
    }

    // 每帧更新
    update() {
        // 可以在这里添加每帧更新的逻辑
        this.viewer.update();
    }
}

// 导出导航系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationSystem;
}
