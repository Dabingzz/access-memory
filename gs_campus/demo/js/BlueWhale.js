/**
 * 小蓝鲸跟随系统
 * 实现南京大学吉祥物小蓝鲸跟随用户相机移动，并支持点击打开AI问答
 */
import * as THREE from 'three';

export class BlueWhale {
    /**
     * 构造函数
     * @param {Object} viewer - GaussianSplats3D.Viewer实例
     * @param {Object} options - 配置选项
     * @param {string} options.modelPath - GLB模型文件路径，默认为'assets/data/bluewheel.glb'
     * @param {number} options.followDistance - 跟随距离，默认为15
     * @param {number} options.followHeight - 跟随高度偏移，默认为5
     * @param {number} options.followOffsetX - 左侧偏移量，默认为-8
     * @param {number} options.scale - 模型缩放，默认为1
     */
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.modelPath = options.modelPath || 'assets/data/bluewheel.glb';
        this.followDistance = options.followDistance || 7;
        this.followHeight = options.followHeight || -2;
        this.followOffsetX = -4;
        this.scale = options.scale || 3;

        // 模型相关
        this.model = null;
        this.mixer = null; // 动画混合器
        this.animations = [];
        this.currentAnimation = null;
        this.GLTFLoader = null; // GLTFLoader类
        this.rotationXOffset = Math.PI / 2; // Y轴旋转偏移（90度）
        this.rotationYOffset = Math.PI / 2; // Y轴旋转偏移（90度）
        this.rotationZOffset = 0; // Y轴旋转偏移（90度）

        // 跟随相关
        this.targetPosition = new THREE.Vector3();
        this.currentPosition = new THREE.Vector3();
        this.smoothFactor = 0.9; // 平滑跟随系数（进一步提高以消除重影）

        // 性能优化：重用Vector3对象，避免每帧创建新对象
        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._up = new THREE.Vector3();
        this._cameraPosition = new THREE.Vector3();
        this._modelToCamera = new THREE.Vector3();
        this._tempVector1 = new THREE.Vector3(); // 临时向量1（用于动画计算）
        this._tempVector2 = new THREE.Vector3(); // 临时向量2（用于动画计算）

        // 动画相关
        this.animationTime = 0; // 动画时间累积器
        this.flyAwayDistance = 8; // 飞走的距离
        this.flyAwayDuration = 4; // 飞走和回来的总时长（秒）
        this.floatAmplitude = 0.2; // 上下浮动的幅度（进一步降低以减少重影）
        this.floatSpeed = 1.2; // 上下浮动的速度（进一步降低）
        this.swingAmplitude = 0.15; // 左右摆动的幅度（进一步降低以减少重影）
        this.swingSpeed = 1.0; // 左右摆动的速度（进一步降低）
        this.enableAnimations = true; // 是否启用动画

        // 快速移动检测
        this._lastCameraPosition = new THREE.Vector3();
        this._cameraSpeed = 0; // 相机移动速度
        this._fastMovementThreshold = 2.0; // 快速移动阈值（单位/秒）

        // 随机动画相关
        this._specialAnimationState = 'idle'; // 特殊动画状态：'idle', 'flyAway', 'circleCamera', 'spin360'
        this._specialAnimationTime = 0; // 特殊动画时间
        this._specialAnimationDuration = 0; // 特殊动画持续时间
        this._specialAnimationStartPosition = new THREE.Vector3(); // 动画开始位置
        this._specialAnimationTargetPosition = new THREE.Vector3(); // 动画目标位置
        this._specialAnimationStartRotation = 0; // 动画开始旋转
        this._lastSpecialAnimationTime = 0; // 上次触发特殊动画的时间
        this._specialAnimationCooldown = 15; // 特殊动画冷却时间（秒）
        this._specialAnimationTriggerProbability = 0.0005; // 每帧触发特殊动画的概率（很低）
        this._specialAnimationType = null; // 当前动画类型
        this.specialAnimationsEnabled = true; // 是否启用特殊动画（对话框打开时禁用）

        // 点击检测相关
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isClickable = true;

        // 初始化状态
        this.isInitialized = false;
        this.isLoading = false;

        // 延迟初始化，避免阻塞页面
        setTimeout(() => {
            this.init().catch((error) => {
                console.error('小蓝鲸初始化失败，但不影响页面使用:', error);
            });
        }, 100);
    }

    /**
     * 初始化小蓝鲸
     */
    async init() {
        try {
            // 等待场景加载完成
            if (!this.viewer.threeScene) {
                console.error('BlueWhale: threeScene未初始化');
                return;
            }

            // 加载GLTFLoader
            await this.loadGLTFLoader();

            // 加载模型（异步，失败时只记录错误，不阻塞页面）
            setTimeout(async () => {
                try {
                    await this.loadModel();
                    this.isInitialized = true;
                } catch (error) {
                    console.error('小蓝鲸模型加载失败，但不影响页面使用:', error);
                    // 不抛出错误，让页面继续运行
                }
            }, 0);

            // 设置点击事件
            this.setupClickDetection();

        } catch (error) {
            console.error('小蓝鲸初始化失败:', error);
        }
    }

    /**
     * 加载GLTFLoader - 使用CDN方式，避免three.core.js的依赖问题
     */
    async loadGLTFLoader() {
        // 由于项目中的three.module.js和three.core.js存在依赖问题（缺少ACESFilmicToneMapping等导出）
        // 我们使用CDN方式加载GLTFLoader，这样可以避免依赖问题
        
        try {
            // 使用CDN加载GLTFLoader（它会使用CDN的Three.js，但这对加载GLB模型没有影响）
            const GLTFLoaderModule = await import('https://cdn.jsdelivr.net/npm/three@0.181.0/examples/jsm/loaders/GLTFLoader.js');
            this.GLTFLoader = GLTFLoaderModule.GLTFLoader;
            console.log('GLTFLoader从CDN加载成功');
        } catch (cdnError) {
            console.error('GLTFLoader从CDN加载失败:', cdnError);
            // 如果CDN失败，尝试本地lib目录（虽然可能也有问题）
            try {
                const { GLTFLoader } = await import('../lib/GLTFLoader.js');
                this.GLTFLoader = GLTFLoader;
                console.log('GLTFLoader从本地lib目录加载成功');
            } catch (localError) {
                console.error('GLTFLoader从本地lib目录也加载失败:', localError);
                throw new Error('GLTFLoader加载失败。请检查网络连接或确保lib/GLTFLoader.js文件存在且完整。错误: ' + (cdnError.message || localError.message));
            }
        }
    }

    /**
     * 加载GLB模型
     */
    async loadModel() {
        if (this.isLoading) {
            console.warn('小蓝鲸模型正在加载中，请勿重复加载');
            return;
        }

        if (!this.GLTFLoader) {
            throw new Error('GLTFLoader未初始化');
        }

        this.isLoading = true;

        return new Promise((resolve, reject) => {
            try {
                const loader = new this.GLTFLoader();
                
                loader.load(
                    this.modelPath,
                    (gltf) => {
                        console.log('小蓝鲸模型加载成功');
                        
                        // 获取模型
                        this.model = gltf.scene;
                        this.model.scale.set(this.scale, this.scale, this.scale);
                        
                        // 设置初始位置（会在update中更新）
                        this.model.position.set(0, 0, 0);
                        
                        
                        // 设置模型可点击
                        this.model.traverse((child) => {
                            if (child.isMesh) {
                                child.userData.isBlueWhale = true;
                            }
                        });

                        // 处理动画
                        if (gltf.animations && gltf.animations.length > 0) {
                            this.mixer = new THREE.AnimationMixer(this.model);
                            this.animations = gltf.animations;
                            
                            // 播放第一个动画（如果有）
                            if (this.animations.length > 0) {
                                this.currentAnimation = this.mixer.clipAction(this.animations[0]);
                                this.currentAnimation.play();
                            }
                        }

                        // 添加到场景
                        if (this.model && this.viewer.threeScene) {
                            this.viewer.threeScene.add(this.model);
                            console.log('小蓝鲸已添加到场景');
                        }

                        this.isLoading = false;
                        resolve();
                    },
                    (progress) => {
                        // 加载进度
                        if (progress.total > 0) {
                            const percent = (progress.loaded / progress.total) * 100;
                            console.log(`小蓝鲸模型加载进度: ${percent.toFixed(2)}%`);
                        }
                    },
                    (error) => {
                        console.error('小蓝鲸模型加载失败:', error);
                        this.isLoading = false;
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('创建GLTFLoader失败:', error);
                this.isLoading = false;
                reject(error);
            }
        });
    }

    /**
     * 设置点击检测
     */
    setupClickDetection() {
        if (!this.viewer.renderer) {
            console.error('BlueWhale: renderer未初始化');
            return;
        }

        const canvas = this.viewer.renderer.domElement;
        
        canvas.addEventListener('click', (event) => {
            if (!this.isClickable || !this.model) return;

            // 计算鼠标在归一化设备坐标中的位置
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // 使用射线检测
            this.raycaster.setFromCamera(this.mouse, this.viewer.camera);
            const intersects = this.raycaster.intersectObject(this.model, true);

            if (intersects.length > 0) {
                console.log('点击了小蓝鲸');
                this.onClick();
            }
        });
    }

    /**
     * 点击小蓝鲸时的处理
     */
    onClick() {
        // 打开AI问答
        if (window.aiAssistant) {
            window.aiAssistant.open();
        } else {
            console.warn('AI助手未初始化，无法打开');
        }
    }

    /**
     * 更新小蓝鲸位置（跟随相机）
     * 应该在每帧的动画循环中调用
     * 性能优化：减少不必要的计算，重用对象
     * @param {number} deltaTime - 时间差（秒），默认为0.016（约60fps）
     */
    update(deltaTime = 0.016) {
        if (!this.model || !this.viewer.camera) return;

        // 检测相机移动速度
        this._cameraPosition.copy(this.viewer.camera.position);
        const cameraMovement = this._cameraPosition.distanceTo(this._lastCameraPosition);
        this._cameraSpeed = cameraMovement / deltaTime; // 单位/秒
        this._lastCameraPosition.copy(this._cameraPosition);

        // 更新动画混合器
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        // 更新动画时间
        if (this.enableAnimations) {
            this.animationTime += deltaTime;
        }

        // 检查是否触发特殊动画（随机触发，概率很低）
        this.checkAndTriggerSpecialAnimation(deltaTime);

        // 更新特殊动画
        if (this._specialAnimationState !== 'idle') {
            this.updateSpecialAnimation(deltaTime);
        } else {
            // 正常跟随模式
        // 计算目标位置（相机左前方）
        this.calculateTargetPosition();

            // 应用动画效果（快速移动时减少动画效果）
        if (this.enableAnimations) {
                // 如果移动速度过快，减少动画效果以避免重影
                const animationScale = this._cameraSpeed > this._fastMovementThreshold 
                    ? 0.3  // 快速移动时大幅减少动画
                    : 1.0; // 正常移动时保持完整动画
                this.applyAnimations(animationScale);
        }

        // 平滑移动到目标位置
            // 快速移动时使用更高的smoothFactor以消除重影
            const dynamicSmoothFactor = this._cameraSpeed > this._fastMovementThreshold 
                ? 0.95  // 快速移动时几乎直接跟随
                : this.smoothFactor; // 正常移动时使用默认值
            this.currentPosition.lerp(this.targetPosition, dynamicSmoothFactor);
        this.model.position.copy(this.currentPosition);
        }

        // 让模型面向相机（修复自转问题）
        this.lookAtCamera();
        
        // 更新AI助手的3D对话框位置（如果打开）
        if (window.aiAssistant && window.aiAssistant.isOpen && window.aiAssistant.dialog3D) {
            window.aiAssistant.update3DDialogPosition();
        }
    }

    /**
     * 计算目标位置（相机左前方）
     * 性能优化：重用Vector3对象，避免每帧创建新对象
     */
    calculateTargetPosition() {
        const camera = this.viewer.camera;
        
        // 重用Vector3对象，避免每帧创建新对象
        camera.getWorldDirection(this._forward);
        
        // 获取相机的右方向量（重用对象）
        this._right.crossVectors(this._forward, camera.up).normalize();
        
        // 获取相机的上方向量（重用对象，避免clone）
        this._up.copy(camera.up).normalize();
        
        // 计算基础目标位置：相机位置 + 前方距离 + 左侧偏移 + 高度偏移
        this.targetPosition.copy(camera.position);
        this.targetPosition.addScaledVector(this._forward, this.followDistance);
        this.targetPosition.addScaledVector(this._right, this.followOffsetX);
        this.targetPosition.addScaledVector(this._up, this.followHeight);
    }

    /**
     * 应用动画效果（飞走又回来、上下浮动、左右摆动等）
     * 性能优化：重用Vector3对象，减少计算复杂度
     * @param {number} scale - 动画缩放系数（0-1），用于在快速移动时减少动画
     */
    applyAnimations(scale = 1.0) {
        if (!this.viewer.camera) return;

        // 重用已计算的向量（在calculateTargetPosition中已计算）
        // 如果还没有计算，则计算一次
        if (this._forward.lengthSq() === 0) {
        const camera = this.viewer.camera;
            camera.getWorldDirection(this._forward);
            this._right.crossVectors(this._forward, camera.up).normalize();
            this._up.copy(camera.up).normalize();
        }

        // 2. 上下浮动动画（应用缩放系数）
        const floatOffset = Math.sin(this.animationTime * this.floatSpeed) * this.floatAmplitude * scale;
        this.targetPosition.addScaledVector(this._up, floatOffset);

        // 3. 左右摆动动画（应用缩放系数）
        const swingOffset = Math.sin(this.animationTime * this.swingSpeed) * this.swingAmplitude * scale;
        this.targetPosition.addScaledVector(this._right, swingOffset);
    }

    /**
     * 让模型面向相机（只在水平面旋转，避免自转）
     * 修复：只让模型在Y轴（水平）旋转，不跟随相机的上下旋转，避免自转问题
     */
    lookAtCamera() {
        if (!this.model || !this.viewer.camera) return;
        
        // 计算从模型到相机的方向向量
        this._modelToCamera.subVectors(this.viewer.camera.position, this.model.position);
        
        // 只使用水平方向（XZ平面），忽略Y轴（上下）分量
        // 这样可以避免相机上下旋转时模型也跟着旋转
        this._modelToCamera.y = 0; // 将Y分量设为0，只保留水平方向
        this._modelToCamera.normalize();
        
        // 如果方向向量有效，让模型朝向该方向
        if (this._modelToCamera.lengthSq() > 0.01) {
            // 计算目标旋转（只在Y轴旋转）
            const targetRotationY = Math.atan2(this._modelToCamera.x, this._modelToCamera.z);
            
            // 平滑旋转到目标角度（避免突然转向）
            const currentRotationY = this.model.rotation.y;
            let rotationDiff = targetRotationY - currentRotationY;
            
            // 处理角度跨越-π到π的边界情况
            if (rotationDiff > Math.PI) {
                rotationDiff -= Math.PI * 2;
            } else if (rotationDiff < -Math.PI) {
                rotationDiff += Math.PI * 2;
            }
            
            // 平滑插值旋转（使用较小的插值系数以保持平滑）
            const baseRotationY = currentRotationY + rotationDiff * 0.15;
            
            // 应用旋转偏移（如果设置了）
            if (this.rotationXOffset !== undefined || this.rotationYOffset !== undefined || this.rotationZOffset !== undefined) {
                // 先设置基础旋转
                this.model.rotation.x = this.rotationXOffset || 0;
                this.model.rotation.y = baseRotationY + (this.rotationYOffset || 0);
                this.model.rotation.z = this.rotationZOffset || 0;
            } else {
                // 如果没有偏移，直接设置Y轴旋转
                this.model.rotation.y = baseRotationY;
            }
        }
    }

    /**
     * 检查并触发特殊动画（随机触发，概率很低）
     * @param {number} deltaTime - 时间差
     */
    checkAndTriggerSpecialAnimation(deltaTime) {
        // 如果特殊动画被禁用（例如对话框打开时），不触发
        if (!this.specialAnimationsEnabled) {
            // 如果正在执行动画，立即停止并返回正常状态
            if (this._specialAnimationState !== 'idle') {
                this._specialAnimationState = 'idle';
                // 恢复到正常跟随位置
                this.calculateTargetPosition();
                this.currentPosition.lerp(this.targetPosition, 0.5);
                this.model.position.copy(this.currentPosition);
            }
            return;
        }

        // 如果正在执行动画，不触发新的
        if (this._specialAnimationState !== 'idle') {
            return;
        }

        // 检查冷却时间
        const timeSinceLastAnimation = this.animationTime - this._lastSpecialAnimationTime;
        if (timeSinceLastAnimation < this._specialAnimationCooldown) {
            return;
        }

        // 快速移动时不触发特殊动画
        if (this._cameraSpeed > this._fastMovementThreshold) {
            return;
        }

        // 随机触发（概率很低）
        if (Math.random() < this._specialAnimationTriggerProbability) {
            // 随机选择一种动画类型
            const animationTypes = ['flyAway', 'circleCamera', 'spin360'];
            this._specialAnimationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
            this.startSpecialAnimation(this._specialAnimationType);
        }
    }

    /**
     * 开始特殊动画
     * @param {string} animationType - 动画类型：'flyAway', 'circleCamera', 'spin360'
     */
    startSpecialAnimation(animationType) {
        if (!this.model || !this.viewer.camera) return;

        this._specialAnimationState = animationType;
        this._specialAnimationTime = 0;
        this._specialAnimationStartPosition.copy(this.model.position);

        const camera = this.viewer.camera;
        camera.getWorldDirection(this._forward);
        this._right.crossVectors(this._forward, camera.up).normalize();
        this._up.copy(camera.up).normalize();

        switch (animationType) {
            case 'flyAway':
                // 跑到远处又回来
                // 计算远处目标位置（相机前方更远的地方）
                this._specialAnimationTargetPosition.copy(camera.position);
                this._specialAnimationTargetPosition.addScaledVector(this._forward, this.followDistance * 3);
                this._specialAnimationTargetPosition.addScaledVector(this._right, this.followOffsetX);
                this._specialAnimationTargetPosition.addScaledVector(this._up, this.followHeight);
                this._specialAnimationDuration = 4; // 4秒完成
                break;

            case 'circleCamera':
                // 围绕相机转一圈
                this._specialAnimationStartRotation = 0;
                this._specialAnimationDuration = 5; // 5秒完成一圈
                break;

            case 'spin360':
                // 在镜头前面360度旋转
                this._specialAnimationStartRotation = 0;
                this._specialAnimationDuration = 3; // 3秒完成
                break;
        }

        this._lastSpecialAnimationTime = this.animationTime;
        console.log(`小蓝鲸开始执行特殊动画: ${animationType}`);
    }

    /**
     * 更新特殊动画
     * @param {number} deltaTime - 时间差
     */
    updateSpecialAnimation(deltaTime) {
        if (!this.model || !this.viewer.camera) return;

        this._specialAnimationTime += deltaTime;
        const progress = Math.min(this._specialAnimationTime / this._specialAnimationDuration, 1);

        const camera = this.viewer.camera;
        camera.getWorldDirection(this._forward);
        this._right.crossVectors(this._forward, camera.up).normalize();
        this._up.copy(camera.up).normalize();

        switch (this._specialAnimationState) {
            case 'flyAway':
                this.updateFlyAwayAnimation(progress);
                break;

            case 'circleCamera':
                this.updateCircleCameraAnimation(progress);
                break;

            case 'spin360':
                this.updateSpin360Animation(progress);
                break;
        }

        // 动画完成，回到正常跟随模式
        if (progress >= 1) {
            this._specialAnimationState = 'idle';
            this._specialAnimationType = null;
            console.log('小蓝鲸特殊动画完成');
        }
    }

    /**
     * 更新"跑到远处又回来"动画
     * @param {number} progress - 动画进度（0-1）
     */
    updateFlyAwayAnimation(progress) {
        // 使用更自然的缓动函数（ease-in-out）
        let easedProgress;
        if (progress < 0.5) {
            // 前半段：飞走（加速）
            easedProgress = progress * 2;
            // 使用三次缓动，让加速更平滑
            easedProgress = easedProgress * easedProgress * easedProgress;
        } else {
            // 后半段：回来（减速）
            easedProgress = (progress - 0.5) * 2;
            // 使用反向三次缓动，让减速更平滑
            easedProgress = 1 - Math.pow(1 - easedProgress, 3);
        }

        // 计算基础位置（重用tempVector1）
        if (progress < 0.5) {
            // 前半段：从起始位置到目标位置
            this._tempVector1.lerpVectors(
                this._specialAnimationStartPosition,
                this._specialAnimationTargetPosition,
                easedProgress
            );
        } else {
            // 后半段：从目标位置回到正常位置
            this.calculateTargetPosition();
            this._tempVector1.lerpVectors(
                this._specialAnimationTargetPosition,
                this.targetPosition,
                easedProgress
            );
        }

        // 添加自然的上下浮动效果（使用正弦波）
        const floatAmplitude = 2.0; // 浮动幅度
        const floatSpeed = 3.0; // 浮动速度
        const floatOffset = Math.sin(progress * Math.PI * floatSpeed) * floatAmplitude * (1 - Math.abs(progress - 0.5) * 2);
        this._tempVector1.addScaledVector(this._up, floatOffset);

        // 添加轻微的左右摆动（使用余弦波）
        const swingAmplitude = 1.5;
        const swingSpeed = 2.5;
        const swingOffset = Math.cos(progress * Math.PI * swingSpeed) * swingAmplitude * (1 - Math.abs(progress - 0.5) * 2);
        this._tempVector1.addScaledVector(this._right, swingOffset);

        // 平滑移动到目标位置
        this.currentPosition.lerp(this._tempVector1, 0.3);
        this.model.position.copy(this.currentPosition);

        // 添加旋转效果，让飞行更自然
        const rotationAmount = Math.sin(progress * Math.PI * 2) * 0.3;
        this.model.rotation.z = rotationAmount;
    }

    /**
     * 更新"围绕相机转一圈"动画
     * @param {number} progress - 动画进度（0-1）
     */
    updateCircleCameraAnimation(progress) {
        const camera = this.viewer.camera;
        
        // 使用缓动函数让旋转更自然（开始和结束时慢，中间快）
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // 计算围绕相机的圆形路径
        const baseRadius = this.followDistance * 1.5; // 基础围绕半径
        // 添加半径变化，让路径更生动（开始时稍远，中间最近，结束时又远一点）
        const radiusVariation = Math.sin(progress * Math.PI) * 0.3; // 半径变化幅度
        const radius = baseRadius * (1 + radiusVariation);
        
        const angle = easedProgress * Math.PI * 2; // 0 到 2π
        
        // 重用临时向量，避免创建新对象
        // 计算水平右方向（在水平面上）
        this._tempVector1.crossVectors(this._forward, this._up).normalize();
        // 如果右方向无效，使用世界坐标系
        if (this._tempVector1.lengthSq() < 0.1) {
            this._tempVector1.set(1, 0, 0);
        }
        
        // 计算水平前方向（垂直于右方向和上方向）
        this._tempVector2.crossVectors(this._up, this._tempVector1).normalize();
        
        // 计算圆形位置（重用targetPosition作为临时变量）
        this.targetPosition.copy(camera.position);
        this.targetPosition.addScaledVector(this._tempVector1, Math.cos(angle) * radius);
        this.targetPosition.addScaledVector(this._tempVector2, Math.sin(angle) * radius);
        
        // 添加高度变化，让路径呈波浪形
        const heightVariation = Math.sin(progress * Math.PI * 2) * 3; // 高度变化幅度
        this.targetPosition.addScaledVector(this._up, this.followHeight + heightVariation);
        
        // 平滑移动到圆形位置
        this.currentPosition.lerp(this.targetPosition, 0.25);
        this.model.position.copy(this.currentPosition);
        
        // 让模型始终面向相机（在圆形路径上）
        this._modelToCamera.subVectors(camera.position, this.model.position);
        this._modelToCamera.y = 0; // 只在水平面旋转
        this._modelToCamera.normalize();
        if (this._modelToCamera.lengthSq() > 0.01) {
            const targetRotationY = Math.atan2(this._modelToCamera.x, this._modelToCamera.z);
            this.model.rotation.y = targetRotationY + (this.rotationYOffset || 0);
        }
    }

    /**
     * 更新"在镜头前面360度旋转"动画
     * @param {number} progress - 动画进度（0-1）
     */
    updateSpin360Animation(progress) {
        // 使用缓动函数，让旋转开始和结束时更平滑
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // 计算镜头前面的位置（正常跟随位置）
        this.calculateTargetPosition();
        
        // 在正常跟随位置的基础上，围绕相机前方向旋转
        const baseSpinRadius = this.followDistance * 0.3; // 基础旋转半径（较小，在镜头前）
        // 添加半径变化，让旋转路径更生动
        const radiusVariation = Math.sin(progress * Math.PI * 3) * 0.15; // 半径变化
        const spinRadius = baseSpinRadius * (1 + radiusVariation);
        
        const angle = easedProgress * Math.PI * 2; // 0 到 2π
        
        // 计算旋转位置（重用tempVector1作为临时变量）
        this._tempVector1.copy(this.targetPosition);
        
        // 在垂直于相机前方向的平面上旋转
        // 使用相机的右方向和上方向
        this._tempVector1.addScaledVector(this._right, Math.cos(angle) * spinRadius);
        this._tempVector1.addScaledVector(this._up, Math.sin(angle) * spinRadius);
        
        // 添加轻微的上下浮动
        const floatOffset = Math.sin(progress * Math.PI * 4) * 1.0;
        this._tempVector1.addScaledVector(this._up, floatOffset);
        
        // 平滑移动到旋转位置
        this.currentPosition.lerp(this._tempVector1, 0.3);
        this.model.position.copy(this.currentPosition);
        
        // 让模型在旋转时稍微倾斜，增加动感
        const tiltAmount = Math.sin(progress * Math.PI * 2) * 0.4;
        this.model.rotation.x = this.rotationXOffset + tiltAmount;
        this.model.rotation.z = Math.cos(progress * Math.PI * 2) * 0.2;
        
        // 让模型始终面向相机
        const camera = this.viewer.camera;
        this._modelToCamera.subVectors(camera.position, this.model.position);
        this._modelToCamera.normalize();
        if (this._modelToCamera.lengthSq() > 0.01) {
            // 只在水平面旋转
            this._modelToCamera.y = 0;
            this._modelToCamera.normalize();
            if (this._modelToCamera.lengthSq() > 0.01) {
                const targetRotationY = Math.atan2(this._modelToCamera.x, this._modelToCamera.z);
                this.model.rotation.y = targetRotationY + (this.rotationYOffset || 0);
            }
        }
    }

    /**
     * 设置跟随参数
     * @param {Object} options - 新的跟随参数
     */
    setFollowOptions(options) {
        if (options.followDistance !== undefined) {
            this.followDistance = options.followDistance;
        }
        if (options.followHeight !== undefined) {
            this.followHeight = options.followHeight;
        }
        if (options.followOffsetX !== undefined) {
            this.followOffsetX = options.followOffsetX;
        }
        if (options.smoothFactor !== undefined) {
            this.smoothFactor = options.smoothFactor;
        }
    }

    /**
     * 显示/隐藏小蓝鲸
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        if (this.model) {
            this.model.visible = visible;
        }
    }

    /**
     * 设置是否可点击
     * @param {boolean} clickable - 是否可点击
     */
    setClickable(clickable) {
        this.isClickable = clickable;
    }

    /**
     * 设置动画参数
     * @param {Object} options - 动画参数选项
     * @param {number} options.flyAwayDistance - 飞走的距离，默认为8
     * @param {number} options.flyAwayDuration - 飞走和回来的总时长（秒），默认为4
     * @param {number} options.floatAmplitude - 上下浮动的幅度，默认为0.5
     * @param {number} options.floatSpeed - 上下浮动的速度，默认为2
     * @param {number} options.swingAmplitude - 左右摆动的幅度，默认为0.3
     * @param {number} options.swingSpeed - 左右摆动的速度，默认为1.5
     */
    setAnimationOptions(options = {}) {
        if (options.flyAwayDistance !== undefined) {
            this.flyAwayDistance = options.flyAwayDistance;
        }
        if (options.flyAwayDuration !== undefined) {
            this.flyAwayDuration = options.flyAwayDuration;
        }
        if (options.floatAmplitude !== undefined) {
            this.floatAmplitude = options.floatAmplitude;
        }
        if (options.floatSpeed !== undefined) {
            this.floatSpeed = options.floatSpeed;
        }
        if (options.swingAmplitude !== undefined) {
            this.swingAmplitude = options.swingAmplitude;
        }
        if (options.swingSpeed !== undefined) {
            this.swingSpeed = options.swingSpeed;
        }
    }

    /**
     * 启用/禁用动画
     * @param {boolean} enabled - 是否启用动画
     */
    setAnimationsEnabled(enabled) {
        this.enableAnimations = enabled;
    }

    /**
     * 销毁小蓝鲸
     */
    dispose() {
        if (this.model && this.viewer.threeScene) {
            this.viewer.threeScene.remove(this.model);
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
        
        this.model = null;
        this.animations = [];
    }
}

