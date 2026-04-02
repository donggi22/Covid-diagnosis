# -*- coding: utf-8 -*-
"""GitHub Release에서 모델 파일을 다운로드하는 스크립트"""
import os
import sys

# Windows 환경에서 UTF-8 출력 지원
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
import requests
import zipfile
import tempfile
import shutil
from pathlib import Path
from tqdm import tqdm

# GitHub Release 정보
GITHUB_REPO = "donggi22/local_Covid-diagnosis"
RELEASE_TAG = "v1.0.0"  # 환경 변수로 오버라이드 가능
MODEL_DIR = Path(__file__).parent.parent.parent

def download_file(url: str, dest_path: Path, chunk_size: int = 8192):
    """파일을 다운로드하고 진행률을 표시"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    total_size = int(response.headers.get('content-length', 0))
    
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(dest_path, 'wb') as f, tqdm(
        desc=dest_path.name,
        total=total_size,
        unit='B',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                bar.update(len(chunk))

def list_available_releases(repo: str):
    """사용 가능한 GitHub Release 목록 가져오기"""
    url = f"https://api.github.com/repos/{repo}/releases"
    headers = {}
    token = os.getenv('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = f'token {token}'
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        releases = response.json()
        return [(r['tag_name'], r['name'], len(r.get('assets', []))) for r in releases]
    return []

def get_release_assets(repo: str, tag: str):
    """GitHub Release의 asset URL 목록 가져오기"""
    url = f"https://api.github.com/repos/{repo}/releases/tags/{tag}"
    headers = {}
    token = os.getenv('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = f'token {token}'
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    release = response.json()
    return {asset['name']: asset['browser_download_url'] for asset in release['assets']}

def extract_zip(zip_path: Path, extract_to: Path):
    """zip 파일을 압축 해제하고 모델 파일을 올바른 위치로 이동"""
    print(f"📦 zip 파일 압축 해제 중: {zip_path}")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # 임시 디렉토리에 압축 해제
        temp_dir = Path(tempfile.mkdtemp())
        zip_ref.extractall(temp_dir)
        
        # 모델 파일 찾기
        seg_model = None
        clf_model = None
        
        # seg_results 폴더에서 찾기
        for seg_file in (temp_dir / "models" / "seg_results").rglob("*.pth"):
            if "best_model" in seg_file.name or "seg" in seg_file.name.lower():
                seg_model = seg_file
                break
        
        # clf_results 폴더에서 찾기
        for clf_file in (temp_dir / "models" / "clf_results").rglob("*.pth"):
            if "best_model" in clf_file.name or "clf" in clf_file.name.lower():
                clf_model = clf_file
                break
        
        # 또는 루트에서 직접 찾기
        if not seg_model:
            for pth_file in temp_dir.rglob("*.pth"):
                if "seg" in pth_file.name.lower() or "segmentation" in pth_file.name.lower():
                    seg_model = pth_file
                    break
        
        if not clf_model:
            for pth_file in temp_dir.rglob("*.pth"):
                if "clf" in pth_file.name.lower() or "classification" in pth_file.name.lower():
                    clf_model = pth_file
                    break
        
        # 모델 파일을 올바른 위치로 복사
        if seg_model:
            seg_dest = extract_to / "seg_best_model.pth"
            seg_dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(seg_model, seg_dest)
            print(f"✅ 분할 모델 추출 완료: {seg_dest}")
        else:
            print("⚠️  분할 모델을 zip 파일에서 찾을 수 없습니다")

        if clf_model:
            clf_dest = extract_to / "clf_best_model.pth"
            clf_dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(clf_model, clf_dest)
            print(f"✅ 분류 모델 추출 완료: {clf_dest}")
        else:
            print("⚠️  분류 모델을 zip 파일에서 찾을 수 없습니다")
        
        # 임시 디렉토리 정리
        shutil.rmtree(temp_dir)
    
    # zip 파일 삭제
    zip_path.unlink()
    print(f"🗑️  임시 zip 파일 삭제: {zip_path}")

def download_models():
    """모델 파일 다운로드"""
    print("📥 GitHub Release에서 모델 파일 다운로드 시작...")
    
    # 환경 변수에서 설정 가져오기
    repo = os.getenv('GITHUB_REPO', GITHUB_REPO)
    tag = os.getenv('MODEL_RELEASE_TAG', RELEASE_TAG)
    
    try:
        assets = get_release_assets(repo, tag)
        print(f"✅ Release {tag}에서 {len(assets)}개 파일 발견")
        print(f"   파일 목록: {list(assets.keys())}")
        
        # zip 파일 찾기
        zip_url = None
        zip_name = None
        for name, url in assets.items():
            if name.endswith('.zip') and ('model' in name.lower() or 'final' in name.lower()):
                zip_url = url
                zip_name = name
                break
        
        # zip 파일이 있으면 zip 파일 처리
        if zip_url and zip_name:
            print(f"📦 zip 파일 발견: {zip_name}")
            zip_path = MODEL_DIR / zip_name
            
            if not (MODEL_DIR / "seg_best_model.pth").exists() or \
               not (MODEL_DIR / "clf_best_model.pth").exists():
                print(f"📥 zip 파일 다운로드 중...")
                download_file(zip_url, zip_path)
                print(f"✅ zip 파일 다운로드 완료: {zip_path}")
                
                # zip 파일 압축 해제
                extract_zip(zip_path, MODEL_DIR)
            else:
                print("⏭️  모델 파일이 이미 존재합니다. 다운로드를 건너뜁니다.")
                if zip_path.exists():
                    zip_path.unlink()
            return
        
        # 개별 파일 다운로드 (zip 파일이 없는 경우)
        seg_url = None
        clf_url = None
        
        for name, url in assets.items():
            if name.endswith('.pth'):
                if 'seg' in name.lower() or 'segmentation' in name.lower():
                    seg_url = url
                elif 'clf' in name.lower() or 'classification' in name.lower():
                    clf_url = url
        
        if seg_url:
            seg_path = MODEL_DIR / "seg_best_model.pth"
            if not seg_path.exists():
                print(f"📥 분할 모델 다운로드 중...")
                download_file(seg_url, seg_path)
                print(f"✅ 분할 모델 다운로드 완료: {seg_path}")
            else:
                print(f"⏭️  분할 모델 이미 존재: {seg_path}")
        else:
            print("⚠️  분할 모델 URL을 찾을 수 없습니다")
            print(f"   사용 가능한 파일: {list(assets.keys())}")
        
        if clf_url:
            clf_path = MODEL_DIR / "clf_best_model.pth"
            if not clf_path.exists():
                print(f"📥 분류 모델 다운로드 중...")
                download_file(clf_url, clf_path)
                print(f"✅ 분류 모델 다운로드 완료: {clf_path}")
            else:
                print(f"⏭️  분류 모델 이미 존재: {clf_path}")
        else:
            print("⚠️  분류 모델 URL을 찾을 수 없습니다")
            print(f"   사용 가능한 파일: {list(assets.keys())}")
            
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print(f"❌ Release 태그 '{tag}'를 찾을 수 없습니다.")
            print(f"\n📋 사용 가능한 Release 목록:")
            try:
                available = list_available_releases(repo)
                if available:
                    for tag_name, name, asset_count in available:
                        print(f"   - 태그: {tag_name} | 이름: {name} | 파일 수: {asset_count}")
                    print(f"\n💡 해결 방법:")
                    print(f"   1. Render 환경 변수 MODEL_RELEASE_TAG를 위 목록의 태그 중 하나로 설정")
                    print(f"   2. 또는 GitHub에서 '{tag}' 태그의 Release를 생성")
                else:
                    print(f"   (사용 가능한 Release가 없습니다)")
                    print(f"\n💡 해결 방법:")
                    print(f"   GitHub에서 Release를 생성하고 모델 파일을 업로드해주세요.")
            except Exception as list_err:
                print(f"   (Release 목록을 가져올 수 없습니다: {list_err})")
        else:
            print(f"❌ GitHub API 오류: {e}")
        raise
    except Exception as e:
        print(f"❌ 모델 다운로드 실패: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    download_models()

