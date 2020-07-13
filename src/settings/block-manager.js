/**
 * External dependencies
 */
import { filter, map, without, union, difference, intersection } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockCategory from './block-category';
import SaveSettings from './save-settings';
import InformationPopover from './information-popover';
import icons from './../icons';

/**
 * Renders the Block Manager tab of the Block Visibility settings page
 *
 * @since 1.0.0
 * @param {Object} props All the props passed to this function
 * @return {string}		 Return the rendered JSX
 */
function BlockManager( props ) {
	const [ disabledBlocks, setDisabledBlocks ] = useState(
		props.disabledBlocks
	);
	const [ hasUpdates, setHasUpdates ] = useState( false );
	const [ search, setSearch ] = useState( '' );

	const {
		handleSettingsChange,
		isAPISaving,
		hasSaveError,
		blockTypes,
		categories,
		hasBlockSupport,
		isMatchingSearchTerm,
		pluginSettings,
	} = props;

	function onSettingsChange() {
		handleSettingsChange( 'disabled_blocks', disabledBlocks );
		setHasUpdates( false );
	}

	function handleBlockCategoryChange( checked, blockTypes ) {
		let currentDisabledBlocks = [ ...disabledBlocks ];

		if ( ! checked ) {
			currentDisabledBlocks = union( currentDisabledBlocks, blockTypes );
		} else {
			currentDisabledBlocks = difference(
				currentDisabledBlocks,
				blockTypes
			);
		}

		setDisabledBlocks( currentDisabledBlocks );
		setHasUpdates( true );
	}

	function handleBlockTypeChange( checked, blockType ) {
		let currentDisabledBlocks = [ ...disabledBlocks ];

		if ( ! checked ) {
			currentDisabledBlocks.push( blockType );
		} else {
			currentDisabledBlocks = without( currentDisabledBlocks, blockType );
		}

		setDisabledBlocks( currentDisabledBlocks );
		setHasUpdates( true );
	}

	// Manually set defaults, this ensures the main settings function properly
	const enabledFullControlMode = pluginSettings?.enable_full_control_mode ?? false; // eslint-disable-line

	let allowedBlockTypes;

	if ( enabledFullControlMode ) {
		// If we are in full control mode, allow all blocks
		allowedBlockTypes = blockTypes;
	} else {
		allowedBlockTypes = blockTypes.filter(
			( blockType ) =>
				// Is allowed to be inserted into a page/post
				hasBlockSupport( blockType, 'inserter', true ) &&
				// Is not a child block https://developer.wordpress.org/block-editor/developers/block-api/block-registration/#parent-optional
				! blockType.parent
		);
	}

	// The allowed blocks that match our search criteria
	const filteredBlockTypes = allowedBlockTypes.filter(
		( blockType ) => ! search || isMatchingSearchTerm( blockType, search )
	);

	// If a plugin with custom blocks is deactivated, we want to keep the
	// disabled blocks settings, but we should not include them in the UI
	// of the Block Manager
	const disabledBlocksState = intersection(
		disabledBlocks,
		map( filteredBlockTypes, 'name' )
	);

	const trueDisabledBlocks = intersection(
		disabledBlocks,
		map( allowedBlockTypes, 'name' )
	);

	let visibilityIcon = icons.visibility;
	let visibilityMessage = __(
		'Visibility is enabled for all blocks',
		'block-visibility'
	);

	if ( trueDisabledBlocks.length ) {
		visibilityIcon = icons.visibilityHidden;
		visibilityMessage = sprintf(
			_n(
				'Visibility is disabled for %s block type',
				'Visibility is disabled for %s block types',
				trueDisabledBlocks.length,
				'block-visibility'
			),
			trueDisabledBlocks.length
		);
	}

	return (
		<div className="bv-block-manager inner-container">
			<div className="bv-tab-panel__description">
				<div className="bv-tab-panel__description-header">
					<h2>{ __( 'Block Manager', 'block-visibility' ) }</h2>
					<span>
						<InformationPopover
							message={ __(
								'Not every block type may need visibility controls. The Block Manager allows you to decide which blocks do. If you are looking for a block, and do not see it listed, you may need to enable Full Control Mode on the Settings tab.',
								'block-visibility'
							) }
							subMessage={ __(
								'To learn more about the Block Manager, review the plugin documentation using the link below.',
								'block-visibility'
							) }
							link="https://www.blockvisibilitywp.com/documentation/block-manager/?utm_source=plugin&utm_medium=settings&utm_campaign=plugin_referrals"
						/>
					</span>
				</div>
				<p>
					{ __(
						'The settings below allow you restrict visibility controls to specific block types. By default, all block types have visibility enabled, but you may want to limit this functionality depending on your needs.',
						'block-visibility'
					) }
				</p>
			</div>
			<div className="bv-setting-controls">
				<TextControl
					className="search-blocks"
					type="search"
					placeholder={ __(
						'Search for a block',
						'block-visibility'
					) }
					value={ search }
					onChange={ ( searchValue ) => setSearch( searchValue ) }
				/>
				<SaveSettings
					isAPISaving={ isAPISaving }
					hasSaveError={ hasSaveError }
					hasUpdates={ hasUpdates }
					onSettingsChange={ onSettingsChange }
					notSavingMessage={ visibilityMessage }
					notSavingIcon={ visibilityIcon }
				/>
			</div>
			<div className="bv-block-manager__category-container">
				{ categories.map( ( category ) => (
					<BlockCategory
						key={ category.slug }
						category={ category }
						blockTypes={ filter( filteredBlockTypes, {
							category: category.slug,
						} ) }
						disabledBlocks={ disabledBlocksState }
						handleBlockCategoryChange={ handleBlockCategoryChange }
						handleBlockTypeChange={ handleBlockTypeChange }
					/>
				) ) }
			</div>
		</div>
	);
}

export default withSelect( ( select ) => {
	const {
		getCategories,
		getBlockTypes,
		hasBlockSupport,
		isMatchingSearchTerm,
	} = select( 'core/blocks' );

	return {
		blockTypes: getBlockTypes(),
		categories: getCategories(),
		hasBlockSupport,
		isMatchingSearchTerm,
	};
} )( BlockManager );
